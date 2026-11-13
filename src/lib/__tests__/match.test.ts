import { describe, expect, it } from 'vitest';
import { acceptedAnswers, checkAnswer, hint, levenshtein, mainTerm, maxHint, normalize } from '../match';

const card = (term: string, alts?: string[]) => ({ term, alts });

describe('normalize', () => {
  it('folds case, accents, quotes, ampersands and leading articles', () => {
    expect(normalize('Adams–Onís Treaty (1819)')).toBe('adams onis treaty 1819');
    expect(normalize('“Don’t give up the ship!”')).toBe('dont give up the ship');
    expect(normalize('Baltimore & Ohio Railroad')).toBe('baltimore and ohio railroad');
    expect(normalize('The Colored American')).toBe('colored american');
    expect(normalize('36°30′ line')).toBe('36 30 line');
  });
});

describe('checkAnswer', () => {
  it('accepts the term with or without its parenthetical, and name-like parentheticals', () => {
    const c = card('Tenskwatawa (“the Prophet”)');
    expect(acceptedAnswers(c)).toContain('prophet');
    expect(checkAnswer('tenskwatawa', c)).toBe('correct');
    expect(checkAnswer('The Prophet', c)).toBe('correct');
    expect(checkAnswer('Louisiana Purchase', card('Louisiana Purchase (1803)'))).toBe('correct');
    expect(checkAnswer('louisiana purchase 1803', card('Louisiana Purchase (1803)'))).toBe('correct');
  });

  it('does not treat dates in parentheses as answers', () => {
    expect(acceptedAnswers(card('Lowell strikes (1834, 1836)'))).not.toContain('1834 1836');
  });

  it('treats small typos as close and big ones as wrong', () => {
    const c = card('Louisiana Purchase (1803)');
    expect(checkAnswer('Lousiana Purchase', c)).toBe('close');
    expect(checkAnswer('Gadsden Purchase', c)).toBe('wrong');
    expect(checkAnswer('', c)).toBe('wrong');
  });

  it('never accepts a different year', () => {
    expect(checkAnswer('Tariff of 1828', card('Tariff of 1816'))).toBe('wrong');
    expect(checkAnswer('Panic of 1837', card('Panic of 1819'))).toBe('wrong');
    expect(checkAnswer('Panic of 1819', card('Panic of 1819'))).toBe('correct');
  });

  it('accepts alternates, spacing differences and & for and', () => {
    expect(checkAnswer('Tariff of Abominations', card('Tariff of 1828 (“Tariff of Abominations”)'))).toBe('correct');
    expect(checkAnswer('burned over district', card('Burned-Over District'))).toBe('correct');
    expect(checkAnswer('burnedover district', card('Burned-Over District'))).toBe('correct');
    expect(checkAnswer('Baltimore and Ohio Railroad', card('Baltimore & Ohio Railroad (1827)'))).toBe('correct');
    expect(checkAnswer('Embargo Act', card('Embargo Act of 1807', ['Embargo Act']))).toBe('correct');
  });

  it('measures edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('same', 'same')).toBe(0);
  });
});

describe('hint', () => {
  it('reveals one more letter of each word per level and keeps punctuation', () => {
    expect(hint('Louisiana Purchase (1803)', 1)).toBe('L________ P_______');
    expect(hint('Louisiana Purchase (1803)', 2)).toBe('Lo_______ Pu______');
    expect(hint('Burned-Over District', 1)).toBe('B_____-____ D_______');
    expect(mainTerm('Erie Canal (1825)')).toBe('Erie Canal');
    expect(maxHint('Erie Canal (1825)')).toBe(4);
  });
});
