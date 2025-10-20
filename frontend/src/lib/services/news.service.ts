import { News, CreateNewsInput } from '@/types';
import { MOCK_NEWS, getNewsById as mockGetNewsById } from '@/lib/mock-data';
import { isContractsEnabled } from '@/config/contracts';
import { 
  getNewsCount, 
  getNewsById as getNewsContractById, 
  createNewsContract,
  handleContractError 
} from '@/lib/contracts/utils';

/**
 * NEWS SERVICE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR NEWS SMART CONTRACT ⭐
 *
 * This service abstracts data fetching for NEWS entities.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * SMART CONTRACT INTEGRATION GUIDE:
 *
 * 1. Add contract imports:
 *    ```typescript
 *    import { readContract, writeContract } from 'wagmi/actions';
 *    import { NewsFactoryABI } from '@/lib/abis/NewsFactory.abi';
 *    import { contracts } from '@/config/contracts';
 *    ```
 *
 * 2. Add environment toggle:
 *    ```typescript
 *    const USE_CONTRACTS = process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true';
 *    ```
 *
 * 3. Update each method to check USE_CONTRACTS:
 *    ```typescript
 *    async getAll() {
 *      if (USE_CONTRACTS) {
 *        const data = await readContract({
 *          address: contracts.newsFactory,
 *          abi: NewsFactoryABI,
 *          functionName: 'getAllActiveNews',
 *        });
 *        return this.mapContractToNews(data);
 *      }
 *      return MOCK_NEWS; // Fallback
 *    }
 *    ```
 *
 * 4. Add mapping functions:
 *    ```typescript
 *    private mapContractToNews(data: any[]): News[] {
 *      return data.map(item => ({
 *        id: item.id.toString(),
 *        title: item.title,
 *        // ... map all fields
 *      }));
 *    }
 *    ```
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class NewsService {
  /**
   * Get all news (active + resolved)
   *
   * Contract Integration:
   * - Function: getNewsCount() + getNewsInfo(id) for each
   * - Returns: News[] struct array
   */
  async getAll(): Promise<News[]> {
    if (!isContractsEnabled()) {
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_NEWS;
    }

    try {
      console.log('[NewsService] Fetching news from contracts...');
      
      // Get total news count
      const totalCount = await getNewsCount();
      console.log('[NewsService] Total news count:', totalCount);

      if (totalCount === 0) {
        return [];
      }

      // Fetch each news item
      const newsPromises = Array.from({ length: totalCount }, (_, i) => 
        getNewsContractById(i.toString())
      );

      const newsResults = await Promise.all(newsPromises);
      const validNews = newsResults.filter(Boolean) as News[];

      console.log('[NewsService] Fetched', validNews.length, 'news items from contracts');
      return validNews;

    } catch (error) {
      console.error('[NewsService] Contract fetch failed, falling back to mock data:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_NEWS;
      }
      
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Get news by ID
   *
   * Contract Integration:
   * - Function: getNewsInfo(uint256 newsId)
   * - Returns: News struct
   */
  async getById(id: string): Promise<News | undefined> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetNewsById(id);
    }

    try {
      console.log('[NewsService] Fetching news by ID from contract:', id);
      
      const news = await getNewsContractById(id);
      
      if (news) {
        console.log('[NewsService] Successfully fetched news:', news.title);
      } else {
        console.log('[NewsService] News not found with ID:', id);
      }
      
      return news || undefined;

    } catch (error) {
      console.error('[NewsService] Contract getById failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockGetNewsById(id);
      }
      
      return undefined;
    }
  }

  /**
   * Get news by category
   *
   * Contract Integration:
   * - Filter client-side after fetching all (since contract doesn't have category filter)
   */
  async getByCategory(category: string): Promise<News[]> {
    const allNews = await this.getAll();
    
    if (category === 'All') {
      return allNews;
    }
    
    return allNews.filter(news => news.category === category);
  }

  /**
   * Get active news only
   *
   * Contract Integration:
   * - Function: getAllActiveNews()
   * - Filter: status === Status.Active
   */
  async getActive(): Promise<News[]> {
    const allNews = await this.getAll();
    return allNews.filter(n => n.status === 'active');
  }

  /**
   * Create new news
   *
   * Contract Integration:
   * - Function: createNews(title, description, category, resolutionCriteria, resolveTime)
   * - Emits: NewsCreated event with newsId
   */
  async create(input: CreateNewsInput): Promise<News> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newNews: News = {
        id: `news-${Date.now()}`,
        title: input.title,
        description: input.description,
        category: input.category,
        endDate: input.endDate,
        resolutionCriteria: input.resolutionCriteria,
        creatorAddress: '0xuser...mock',
        createdAt: new Date(),
        status: 'active',
        totalPools: 0,
        totalStaked: 0
      };

      return newNews;
    }

    try {
      console.log('[NewsService] Creating news via smart contract...', input);

      // Call smart contract to create news
      const result = await createNewsContract(
        input.title,
        input.description,
        input.category,
        input.resolutionCriteria,
        input.endDate
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log('[NewsService] News creation transaction successful:', result.hash);

      // Get the current news count to find the latest news ID
      // Note: This assumes the new news gets the next sequential ID
      const newsCount = await getNewsCount();
      const newNewsId = (newsCount - 1).toString(); // Latest news has highest ID
      
      // Fetch the newly created news
      const newNews = await this.getById(newNewsId);
      
      if (!newNews) {
        throw new Error('Failed to fetch created news from contract');
      }

      console.log('[NewsService] Successfully created and fetched new news:', newNews.title);
      return newNews;

    } catch (error) {
      console.error('[NewsService] Create news failed:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Search news by query
   * (Client-side filtering, no contract needed)
   */
  async search(query: string): Promise<News[]> {
    if (!query.trim()) return this.getAll();

    const allNews = await this.getAll();
    const lowercaseQuery = query.toLowerCase();

    return allNews.filter(news =>
      news.title.toLowerCase().includes(lowercaseQuery) ||
      news.description.toLowerCase().includes(lowercaseQuery) ||
      news.resolutionCriteria.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get news statistics
   * (Can be calculated client-side or fetched from contract)
   */
  async getStats() {
    const allNews = await this.getAll();
    const activeNews = allNews.filter(n => n.status === 'active');

    return {
      total: allNews.length,
      active: activeNews.length,
      resolved: allNews.filter(n => n.status === 'resolved').length,
      totalStaked: activeNews.reduce((sum, n) => sum + n.totalStaked, 0),
      totalPools: activeNews.reduce((sum, n) => sum + n.totalPools, 0),
    };
  }
}

// Export singleton instance
export const newsService = new NewsService();
