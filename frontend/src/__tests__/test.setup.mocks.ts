import '@testing-library/jest-dom';

// api calls
jest.mock('../components/game-logic/api', () => ({
  sendHandInfoToBackend: jest.fn().mockResolvedValue({}),
  loadHands: jest.fn().mockResolvedValue([])
})); 