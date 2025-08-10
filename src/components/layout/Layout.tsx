import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { ProductList } from '../Product/ProductList';
import { ProductNavigation } from '../Product/ProductNavigation';
import { Footer } from '../Footer/Footer';
import { Cart } from '../Cart/Cart';
import { PaymentModal } from '../Payment/PaymentModal';
import { PaymentOptionsModal } from '../Payment/PaymentOptionsModal';
import { OrderTypeModal } from '../Order/OrderTypeModal';
import { Notification } from '../Notification/Notification';
import { Login } from '../Auth/Login';
import { Register } from '../Auth/Register';
import { AppRoutes } from '../../routes';
import { uiService } from '../../services/uiService';
import { filterService } from '../../services/filterService';
import {
    MainCategory,
    FilterState,
    SORT_OPTIONS
} from '../../types';

export const Layout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    
    const [activeCategory, setActiveCategory] = useState<MainCategory>('all');
    const [selectedFilters, setSelectedFilters] = useState<FilterState>({});
    const [sortBy, setSortBy] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

    useEffect(() => {
        // Initialize UI service after components are mounted
        setTimeout(() => {
            uiService.initialize();
        }, 0);
    }, []);

    const handleCategoryChange = (category: MainCategory) => {
        setActiveCategory(category);
        setSelectedFilters({}); // Reset filters when changing category
        setSortBy(''); // Reset sort when changing category
    };

    useEffect(() => {
        if (activeCategory !== 'all') {
            filterService.getOptions(activeCategory)
                .then(setFilterOptions)
                .catch(err => {
                    console.error('Failed to load filter options', err);
                    setFilterOptions({});
                });
        } else {
            setFilterOptions({});
        }
    }, [activeCategory]);

    const handleFilterChange = (filterType: string, value: string) => {
        setSelectedFilters(prev => {
            const currentFilters = prev[filterType] || [];
            if (currentFilters.includes(value)) {
                return {
                    ...prev,
                    [filterType]: currentFilters.filter(v => v !== value)
                };
            } else {
                return {
                    ...prev,
                    [filterType]: [...currentFilters, value]
                };
            }
        });
    };

    const handleSortChange = (sortOption: string) => {
        setSortBy(sortOption);
    };

    const clearFilters = () => {
        setSelectedFilters({});
        setSortBy('');
        setSearchQuery('');
    };

    const getSelectedFiltersCount = () => {
        return Object.values(selectedFilters).reduce((count, values) => count + values.length, 0);
    };

    const FILTER_TITLES: Record<string, string> = {
        occasion: 'Dịp sử dụng',
        flavor: 'Hương vị',
        ingredient: 'Thành phần chính',
        size: 'Kích thước',
        type: 'Loại'
    };

    const renderFilters = () => {
        const entries = Object.entries(filterOptions);
        if (entries.length === 0) return null;

        const filterCount = getSelectedFiltersCount();

        return (
            <>
                <div className="filter-header">
                    <h3 className="category-title">Bộ lọc sản phẩm</h3>
                    {filterCount > 0 && (
                        <button className="clear-filters" onClick={clearFilters}>
                            Xóa ({filterCount})
                        </button>
                    )}
                </div>

                {entries.map(([key, options]) => (
                    <div key={key} className="filter-section">
                        <h4>{FILTER_TITLES[key] || key}</h4>
                        <div className="filter-options">
                            {options.map(option => (
                                <div key={option} className="filter-option">
                                    <input
                                        type="checkbox"
                                        id={`${key}-${option}`}
                                        checked={selectedFilters[key]?.includes(option) || false}
                                        onChange={() => handleFilterChange(key, option)}
                                    />
                                    <label htmlFor={`${key}-${option}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="sort-section">
                    <span className="sort-label">Sắp xếp theo:</span>
                    <div className="sort-options">
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`sort-btn ${sortBy === option.id ? 'active' : ''}`}
                                onClick={() => handleSortChange(option.id)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            <Header onSearch={setSearchQuery} />
            
            {isHomePage && (
                <ProductNavigation 
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                />
            )}

            <div className="main-container">
                {isHomePage && activeCategory !== 'all' && (
                    <aside className="sidebar">
                        <div className="category-menu">
                            {renderFilters()}
                        </div>
                    </aside>
                )}

                <main className="content-area">
                    <AppRoutes 
                        category={activeCategory}
                        filters={selectedFilters}
                        sortBy={sortBy}
                        searchQuery={searchQuery}
                    />
                </main>
            </div>

            <Footer />

            {/* Auth Components */}
            <Login />
            <Register />

            {/* Overlays and Modals */}
            <div className="dropdown-overlay"></div>
            <Cart />
            <Notification />
            <PaymentOptionsModal />
            <PaymentModal />
            <OrderTypeModal />
        </>
    );
};