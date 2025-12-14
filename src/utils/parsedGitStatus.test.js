import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseGitStatusOutput } from './parsedGitStatus.js';

describe('parseGitStatusOutput', () => {
    it('returns null for empty input', () => {
        assert.strictEqual(parseGitStatusOutput(''), null);
        assert.strictEqual(parseGitStatusOutput(null), null);
        assert.strictEqual(parseGitStatusOutput(undefined), null);
    });

    it('parses modified files', () => {
        const input = ' M src/file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'unmodified', workingTree: 'modified', file: 'src/file.js' },
        ]);
    });

    it('parses staged files', () => {
        const input = 'M  src/file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'modified', workingTree: 'unmodified', file: 'src/file.js' },
        ]);
    });

    it('parses untracked files', () => {
        const input = '?? new-file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'untracked', workingTree: 'untracked', file: 'new-file.js' },
        ]);
    });

    it('parses added files', () => {
        const input = 'A  src/new.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'added', workingTree: 'unmodified', file: 'src/new.js' },
        ]);
    });

    it('parses deleted files', () => {
        const input = ' D old-file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'unmodified', workingTree: 'deleted', file: 'old-file.js' },
        ]);
    });

    it('parses renamed files and extracts new name', () => {
        const input = 'R  old-name.js -> new-name.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'renamed', workingTree: 'unmodified', file: 'new-name.js' },
        ]);
    });

    it('parses copied files and extracts new name', () => {
        const input = 'C  original.js -> copy.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'copied', workingTree: 'unmodified', file: 'copy.js' },
        ]);
    });

    it('parses renamed files with paths', () => {
        const input = 'R  src/old/path.js -> src/new/path.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'renamed', workingTree: 'unmodified', file: 'src/new/path.js' },
        ]);
    });

    it('parses multiple files', () => {
        const input = 'M  staged.js\n M modified.js\n?? untracked.js\nR  old.js -> new.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'modified', workingTree: 'unmodified', file: 'staged.js' },
            { index: 'unmodified', workingTree: 'modified', file: 'modified.js' },
            { index: 'untracked', workingTree: 'untracked', file: 'untracked.js' },
            { index: 'renamed', workingTree: 'unmodified', file: 'new.js' },
        ]);
    });

    it('handles files with spaces in names', () => {
        const input = ' M path/to/file with spaces.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'unmodified', workingTree: 'modified', file: 'path/to/file with spaces.js' },
        ]);
    });
});
