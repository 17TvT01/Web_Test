export const filterService = {
    async getOptions(category: string): Promise<Record<string, string[]>> {
        const response = await fetch(`http://localhost:5000/filter-options?category=${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch filter options');
        }
        return response.json();
    }
};
