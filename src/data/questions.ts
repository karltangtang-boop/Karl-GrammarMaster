import { Question, Difficulty, GrammarCategory } from '../types';

export const questions: Question[] = [
  {
    id: 1,
    sentence: "______ tired, she still finished the report on time.",
    options: [
      { id: 'a', text: 'Although' },
      { id: 'b', text: 'Because' },
      { id: 'c', text: 'Unless' },
      { id: 'd', text: 'Since' }
    ],
    correctOptionId: 'a',
    difficulty: Difficulty.Beginner,
    category: GrammarCategory.AdverbialClause,
    explanation: {
      correctAnswer: 'Although',
      rule: 'Although 引导让步状语从句，意为“尽管”。句子表示虽然累，但仍然完成了报告，存在转折关系。',
      example: 'Although it was raining, they went out for a walk.',
      commonMistake: '容易与 because (因为) 混淆，需根据句意判断因果还是转折。',
      reviewLink: 'https://www.google.com/search?q=although+usage'
    }
  },
  {
    id: 2,
    sentence: "The boy ______ is standing under the tree is my brother.",
    options: [
      { id: 'a', text: 'which' },
      { id: 'b', text: 'who' },
      { id: 'c', text: 'whom' },
      { id: 'd', text: 'whose' }
    ],
    correctOptionId: 'b',
    difficulty: Difficulty.Beginner,
    category: GrammarCategory.RelativeClause,
    explanation: {
      correctAnswer: 'who',
      rule: 'who 引导定语从句，先行词是人 (The boy)，且在从句中作主语。',
      example: 'The girl who lives next door is a teacher.',
      commonMistake: '误用 which (先行词为物) 或 whom (在从句中作宾语)。',
      reviewLink: 'https://www.google.com/search?q=relative+clause+who+vs+which'
    }
  },
  {
    id: 3,
    sentence: "I saw him ______ the street when I was waiting for the bus.",
    options: [
      { id: 'a', text: 'cross' },
      { id: 'b', text: 'crossed' },
      { id: 'c', text: 'to cross' },
      { id: 'd', text: 'crosses' }
    ],
    correctOptionId: 'a',
    difficulty: Difficulty.Intermediate,
    category: GrammarCategory.NonFiniteVerb,
    explanation: {
      correctAnswer: 'cross',
      rule: 'see sb. do sth. 表示看见某人做了某事（全过程）；see sb. doing sth. 表示看见某人正在做某事。',
      example: 'I saw her enter the room.',
      commonMistake: '误加 to，感官动词 see/hear/watch 后接不带 to 的不定式。',
      reviewLink: 'https://www.google.com/search?q=see+sb+do+vs+doing'
    }
  },
  {
    id: 4,
    sentence: "This is the place ______ I visited last year.",
    options: [
      { id: 'a', text: 'where' },
      { id: 'b', text: 'which' },
      { id: 'c', text: 'when' },
      { id: 'd', text: 'what' }
    ],
    correctOptionId: 'b',
    difficulty: Difficulty.Intermediate,
    category: GrammarCategory.RelativeClause,
    explanation: {
      correctAnswer: 'which',
      rule: '虽然先行词是地点 (place)，但在从句中 visit 是及物动词，需要宾语，因此用 which 或 that。',
      example: 'This is the house which my father built.',
      commonMistake: '看到地点就选 where。如果从句缺主语或宾语，应选 which/that。',
      reviewLink: 'https://www.google.com/search?q=where+vs+which+relative+clause'
    }
  },
  {
    id: 5,
    sentence: "______ the homework, he went out to play football.",
    options: [
      { id: 'a', text: 'Finish' },
      { id: 'b', text: 'Finished' },
      { id: 'c', text: 'Finishing' },
      { id: 'd', text: 'To finish' }
    ],
    correctOptionId: 'c',
    difficulty: Difficulty.Advanced,
    category: GrammarCategory.NonFiniteVerb,
    explanation: {
      correctAnswer: 'Finishing',
      rule: '现在分词短语作时间状语，表示动作与主句动作同时或紧接着发生，且逻辑主语 he 与 finish 是主动关系。',
      example: 'Hearing the news, they jumped with joy.',
      commonMistake: '误用过去分词 Finished (被动关系) 或不定式 To finish (目的状语)。',
      reviewLink: 'https://www.google.com/search?q=present+participle+as+adverbial'
    }
  }
];
