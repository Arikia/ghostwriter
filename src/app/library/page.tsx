'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Article {
  id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  text: string;
  price: number;
}

const Page: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filters, setFilters] = useState({
    lastName: '',
    subject: '',
    id: ''
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

    if (filters.id) {
      filtered = filtered.filter(article => 
        article.id.toString().includes(filters.id)
      );
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
            <label htmlFor="lastName">Author Last Name</label>
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
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              value={filters.id}
              onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            />
          </div>
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.cards}>
          {filteredArticles.map((article) => (
            <div key={article.id} className={styles.card}>
              <h2>{article.title}</h2>
              <p><strong>Author:</strong> {article.author_first_name} {article.author_last_name}</p>
              <p>{article.text}</p>
              <p><strong>Price:</strong> ${article.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
