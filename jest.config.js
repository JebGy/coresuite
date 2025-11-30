module.exports = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          { tsconfig: { jsx: 'react-jsx', module: 'commonjs' }, diagnostics: false }
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
      },
      testMatch: [
        '<rootDir>/app/**/*.test.(ts|tsx)',
        '<rootDir>/app/**/?(*.)+(spec|test).(ts|tsx)'
      ],
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        '!app/**/page.tsx',
        '!app/layout.tsx'
      ],
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      transform: {
        '^.+\\.(ts)$': [
          'ts-jest',
          { tsconfig: { module: 'commonjs' }, diagnostics: false }
        ],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
      },
      testMatch: [
        '<rootDir>/(lib|app/actions|pages/api)/**/*.test.ts',
        '<rootDir>/(lib|app/actions|pages/api)/**/?(*.)+(spec|test).ts'
      ],
      collectCoverageFrom: [
        'lib/**/*.ts',
        'app/actions/**/*.ts',
        'pages/api/**/*.ts'
      ],
    }
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: { functions: 80, lines: 80, statements: 80 }
  }
};
