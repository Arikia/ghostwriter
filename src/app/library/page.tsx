import React from 'react';
import fs from 'fs';
import path from 'path';

interface Article {
  id: number;
  author_first_name: string;
  author_last_name: string;
  title: string;
  text: string;
  price: number;
}

interface Props {
  articles: Article[];
}

const Page: React.FC<Props> = ({ articles }) => {
  return (
    <div className="page">
      <div className="sidebar">
        {/* Sidebar content */}
      </div>
      <div className="content">
        <div className="filters">
          <div className="text">Filters</div>
        </div>
        <div className="cards">
          {articles.map((article) => (
            <div key={article.id} className="card">
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

export async function getStaticProps() {
  // Path to your JSON file
  const filePath = path.resolve('data', 'users.json');

  // Read and parse the JSON file
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const articles: Article[] = JSON.parse(fileContents);

  return {
    props: {
      articles,
    },
  };
}

export default Page;
