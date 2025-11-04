// Example React Hook for Skill Trading Feature
// Place this in your frontend project

import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch users for skill trading
 * @param {Object} filters - Filter options for the API
 * @returns {Object} - { users, loading, error, pagination, refetch }
 */
export const useSkillTrading = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get access token from your auth context/storage
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('/api/v1/skills/users-for-trading', {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(filters)]); // Re-fetch when filters change

  return { users, loading, error, pagination, refetch: fetchUsers };
};

// ============================================
// EXAMPLE COMPONENT USAGE
// ============================================

const SkillTradingPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const { users, loading, error, pagination, refetch } = useSkillTrading(filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) return <div>Loading skill traders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="skill-trading-container">
      <h1>Find Skill Trading Partners</h1>

      {/* Filter Controls */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search offered skills..."
          onChange={(e) => handleFilterChange('offeredSkill', e.target.value)}
        />
        
        <input
          type="text"
          placeholder="Search required skills..."
          onChange={(e) => handleFilterChange('requiredSkill', e.target.value)}
        />

        <select onChange={(e) => handleFilterChange('proficiencyLevel', e.target.value)}>
          <option value="">All Proficiency Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        <select onChange={(e) => handleFilterChange('learningPriority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <input
          type="text"
          placeholder="City..."
          onChange={(e) => handleFilterChange('city', e.target.value)}
        />

        <input
          type="number"
          placeholder="Min Rating"
          min="0"
          max="5"
          step="0.1"
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
        />

        <select onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
          <option value="rating">Sort by Rating</option>
          <option value="totalExchanges">Sort by Exchanges</option>
          <option value="createdAt">Sort by Date</option>
        </select>
      </div>

      {/* User List */}
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found with the current filters.</p>
        ) : (
          users.map((userProfile) => (
            <div key={userProfile._id} className="user-card">
              <div className="user-header">
                <img 
                  src={userProfile.user.profileImage || '/default-avatar.png'} 
                  alt={userProfile.user.name}
                />
                <div>
                  <h3>{userProfile.user.name}</h3>
                  <p>{userProfile.user.profession}</p>
                  <p>
                    {userProfile.user.address.city}, {userProfile.user.address.country}
                  </p>
                </div>
                <div className="rating">
                  ⭐ {userProfile.rating.toFixed(1)} 
                  <span>({userProfile.totalExchanges} exchanges)</span>
                </div>
              </div>

              <div className="user-bio">
                <p>{userProfile.user.bio}</p>
              </div>

              <div className="skills-section">
                <div className="offered-skills">
                  <h4>Offers:</h4>
                  <div className="skill-tags">
                    {userProfile.offeredSkills.map((skill) => (
                      <span key={skill._id} className="skill-tag offered">
                        {skill.name} ({skill.proficiencyLevel})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="required-skills">
                  <h4>Looking for:</h4>
                  <div className="skill-tags">
                    {userProfile.requiredSkills.map((skill) => (
                      <span key={skill._id} className="skill-tag required">
                        {skill.name} ({skill.learningPriority} priority)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="user-actions">
                <button onClick={() => handleConnect(userProfile.user._id)}>
                  Connect
                </button>
                <button onClick={() => viewProfile(userProfile.user._id)}>
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          
          <span>
            Page {pagination.page} of {pagination.totalPages} 
            ({pagination.totalUsers} total users)
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// EXAMPLE API SERVICE (Alternative Approach)
// ============================================

export class SkillTradingService {
  static baseURL = '/api/v1/skills';

  /**
   * Get users for skill trading
   * @param {Object} filters - Query parameters
   * @returns {Promise<Object>} API response
   */
  static async getUsersForTrading(filters = {}) {
    const token = localStorage.getItem('accessToken');
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );

    const response = await fetch(
      `${this.baseURL}/users-for-trading?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  }

  /**
   * Search for skill traders by specific criteria
   */
  static async searchBySkillMatch(offeredSkill, requiredSkill) {
    return this.getUsersForTrading({
      offeredSkill,
      requiredSkill,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  }

  /**
   * Find local skill traders
   */
  static async findLocalTraders(city, country) {
    return this.getUsersForTrading({
      city,
      country,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
  }

  /**
   * Find highly-rated experts
   */
  static async findExperts(minRating = 4.0) {
    return this.getUsersForTrading({
      proficiencyLevel: 'expert',
      minRating,
      sortBy: 'totalExchanges',
      sortOrder: 'desc',
    });
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Using the custom hook
const MyComponent1 = () => {
  const { users, loading } = useSkillTrading({
    offeredSkill: 'React',
    minRating: 4.0,
  });

  // Render UI...
};

// Example 2: Using the service class
const MyComponent2 = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    SkillTradingService.findExperts(4.5)
      .then((response) => setUsers(response.data.users))
      .catch((error) => console.error(error));
  }, []);

  // Render UI...
};

// Example 3: Advanced filtering
const MyComponent3 = () => {
  const { users } = useSkillTrading({
    categories: 'Web Development,Mobile Apps',
    proficiencyLevel: 'expert',
    city: 'New York',
    minRating: 4.0,
    page: 1,
    limit: 20,
  });

  // Render UI...
};

export default SkillTradingPage;
