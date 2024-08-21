'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Article {
  id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  First_part: string;
  price: number;
}

const Page: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filters, setFilters] = useState({
    lastName: '',
    subject: '',
    price: ''
  });

  // Fetch articles from the local JSON file
  const fetchArticles = async () => {
    try {
      const response = await fetch('/data/articles.json');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data);
      setFilteredArticles(data); // Initialize filtered articles
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = articles;

    if (filters.lastName) {
      filtered = filtered.filter(article =>
        article.author_last_name.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }

    if (filters.subject) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    if (filters.price) {
      const maxPrice = parseFloat(filters.price);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(article =>
          article.price <= maxPrice
        );
      }
    }

    setFilteredArticles(filtered);
  };

  // Fetch articles on initial render
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <label htmlFor="lastName">Author's last name</label>
            <input
              type="text"
              id="lastName"
              value={filters.lastName}
              onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="price">Max price</label>
            <input
              type="text"
              id="price"
              value={filters.price}
              onChange={(e) => setFilters({ ...filters, price: e.target.value })}
            />
          </div>
          <button onClick={applyFilters} className={styles.button}>
            Apply Filters
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.cards}>
          {filteredArticles.map((article) => (
            <div key={article.id} className={styles.card}>
              <h2>{article.title}</h2>
              <p><strong>Author:</strong> {article.author_first_name} {article.author_last_name}</p>
              <p>{article.First_part}</p>
              <p><strong>Price:</strong> ${article.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
