import React from 'react';
import pool from '@/lib/db';

interface User {
    id: number;
    name: string;
    email: string;
}

const Page: React.FC = async () => {
    // Fetch users from the database
    let users: User[] = [];
    try {
        const [rows] = await pool.query('SELECT id, name, email FROM users');
        users = rows as User[];
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }

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
                    {users.map((user) => (
                        <div key={user.id} className="card">
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
