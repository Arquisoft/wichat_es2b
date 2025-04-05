import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Ranking from './Ranking';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));
jest.mock('axios');

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8001';

describe('Ranking Component', () => {
  beforeEach(() => {
    axios.get.mockClear();
    mockedUsedNavigate.mockClear();
  });

  test('renders loading state initially', () => {
    axios.get.mockResolvedValue({ data: [] });
    render(
      <Router>
        <Ranking />
      </Router>
    );
    expect(screen.getByText(/Loading ranking.../i)).toBeInTheDocument();
  });

  test('renders error message on fetch failure', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValueOnce({ message: errorMessage });
    render(
      <Router>
        <Ranking />
      </Router>
    );
    await waitFor(() => expect(screen.getByText(new RegExp(`Failed to fetch ranking data. ${errorMessage}`, 'i'))).toBeInTheDocument());
    expect(screen.queryByText(/Loading ranking.../i)).not.toBeInTheDocument();
  });

  test('renders ranking data correctly', async () => {
    const rankingData = [
      { username: 'user1', score: 10, profileImage: 'profile_5.gif' },
      { username: 'user2', score: 8, profileImage: 'profile_default.png' },
      { username: 'user3', score: 5 }, // User without profile image
    ];
    axios.get.mockResolvedValueOnce({ data: rankingData });
    render(
      <Router>
        <Ranking />
      </Router>
    );
    await waitFor(() => expect(screen.queryByText(/Loading ranking.../i)).not.toBeInTheDocument());

    expect(screen.getByText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();

    // User 1
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByAltText('user1')).toHaveAttribute('src', '/profile/profile_5.gif');

    // User 2
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByAltText('user2')).toHaveAttribute('src', '/profile/profile_default.png');

     // User 3 (fallback image)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByAltText('user3')).toHaveAttribute('src', '/profile/profile_1.gif'); // Default fallback image check
  });

  test('renders error message on invalid data format from server', async () => {
    // Simulate server returning non-array data
    axios.get.mockResolvedValueOnce({ data: { error: 'invalid format' } });
    render(
      <Router>
        <Ranking />
      </Router>
    );
    await waitFor(() => expect(screen.getByText(/Invalid data format received from server./i)).toBeInTheDocument());
     expect(screen.queryByText(/Loading ranking.../i)).not.toBeInTheDocument();
  });

  test('calls navigate on Back to Menu click', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(
      <Router>
        <Ranking />
      </Router>
    );
    await waitFor(() => expect(screen.queryByText(/Loading ranking.../i)).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/menu');
  });
});