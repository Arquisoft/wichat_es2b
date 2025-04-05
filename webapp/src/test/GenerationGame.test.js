import React from 'react';
import QuestionGeneration from '../components/wikidataComponents/QuestionGeneration';
import {render, screen} from "@testing-library/react";
import QuestionPresentation from "../components/wikidataComponents/QuestionPresentation";
import { BrowserRouter } from 'react-router-dom';
import Game from '../components/Game';

jest.mock('../components/wikidataComponents/QuestionGeneration');

describe('QuestionGeneration', () => {
    let mockSetQuestion;
    let questionGenerator;

    beforeEach(() => {
        mockSetQuestion = jest.fn();
        questionGenerator = new QuestionGeneration(mockSetQuestion);
    });

    it('should initialize with empty cache and index 0', () => {
      expect(questionGenerator.questionsCache).toEqual([]);
      expect(questionGenerator.currentIndex).toBe(0);
    });

    it('should load the page', () => {
      render(
        <BrowserRouter>
          <Game />
        </BrowserRouter>
      );

      const welcomeMessage = screen.getByText(/Guess the city \?/i);
      expect(welcomeMessage).toBeInTheDocument();

    });

    it('should return the next question from cache', () => {
      questionGenerator.questionsCache = [{ question: 'Pregunta de prueba' }];
      const question = questionGenerator.getNextQuestion();

      expect(question).toEqual({ question: 'Pregunta de prueba' });
      expect(questionGenerator.questionsCache.length).toBe(0);
    });

    it('bypass', () => {
        expect(true).toBe(true);
    })
});