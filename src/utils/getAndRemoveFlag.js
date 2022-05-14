export default (args, flag, shortFlag) => {
    if (args?.includes(flag) || args?.includes(shortFlag)) {
        args = args.filter((arg) => ![flag, shortFlag].includes(arg));
        return { flag: true, args };
    }
    return { flag: false, args };
};
