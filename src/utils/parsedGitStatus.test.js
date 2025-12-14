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
            { index: 'unmodified', workingTree: 'modified', file: 'src/file.js', renamedFrom: null },
        ]);
    });

    it('parses staged files', () => {
        const input = 'M  src/file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'modified', workingTree: 'unmodified', file: 'src/file.js', renamedFrom: null },
        ]);
    });

    it('parses untracked files', () => {
        const input = '?? new-file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'untracked', workingTree: 'untracked', file: 'new-file.js', renamedFrom: null },
        ]);
    });

    it('parses added files', () => {
        const input = 'A  src/new.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'added', workingTree: 'unmodified', file: 'src/new.js', renamedFrom: null },
        ]);
    });

    it('parses deleted files', () => {
        const input = ' D old-file.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'unmodified', workingTree: 'deleted', file: 'old-file.js', renamedFrom: null },
        ]);
    });

    it('parses renamed files with both old and new names', () => {
        const input = 'R  old-name.js -> new-name.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'renamed', workingTree: 'unmodified', file: 'new-name.js', renamedFrom: 'old-name.js' },
        ]);
    });

    it('parses copied files with both original and copy names', () => {
        const input = 'C  original.js -> copy.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'copied', workingTree: 'unmodified', file: 'copy.js', renamedFrom: 'original.js' },
        ]);
    });

    it('parses renamed files with paths', () => {
        const input = 'R  src/old/path.js -> src/new/path.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'renamed', workingTree: 'unmodified', file: 'src/new/path.js', renamedFrom: 'src/old/path.js' },
        ]);
    });

    it('parses multiple files', () => {
        const input = 'M  staged.js\n M modified.js\n?? untracked.js\nR  old.js -> new.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'modified', workingTree: 'unmodified', file: 'staged.js', renamedFrom: null },
            { index: 'unmodified', workingTree: 'modified', file: 'modified.js', renamedFrom: null },
            { index: 'untracked', workingTree: 'untracked', file: 'untracked.js', renamedFrom: null },
            { index: 'renamed', workingTree: 'unmodified', file: 'new.js', renamedFrom: 'old.js' },
        ]);
    });

    it('handles files with spaces in names', () => {
        const input = ' M path/to/file with spaces.js\n';
        const result = parseGitStatusOutput(input);

        assert.deepStrictEqual(result, [
            { index: 'unmodified', workingTree: 'modified', file: 'path/to/file with spaces.js', renamedFrom: null },
        ]);
    });
});
