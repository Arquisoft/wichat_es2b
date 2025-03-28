import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Menu from './Menu';
import { BrowserRouter } from 'react-router-dom';

const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Componente Menu', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset();
  });

  it('se renderiza correctamente', () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );

    expect(screen.getByAltText(/Non Timed Game/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Statistics/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Ranking/i)).toBeInTheDocument();
  });

  it('navega a la página de juego sin tiempo al hacer clic en "Non Timed game!"', () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByAltText(/Non Timed Game/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/game');
  });

  it('navega a la página de stadistics al hacer clic en "Stadistics"', () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByAltText(/Statistics/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/stadistics');
  });

  it('navega a la página de ranking al hacer clic en "Ranking"', () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByAltText(/Ranking/i));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/ranking');
  });
});
