/**
 * Escapes a string for safe use in shell commands.
 * Wraps the argument in single quotes and escapes any single quotes within.
 */
export function shellEscape(arg) {
    return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Escapes an array of arguments and joins them with spaces.
 */
export function shellEscapeArgs(args) {
    return args.map(shellEscape).join(' ');
}
