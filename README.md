# NodeJS Git utilities

## Purpose

Enhance the usage of git in the command line. In general this is achieved by providing a list of options when not giving the required arguments to git commands. The scripts in this repo do not aim to do anything that can be achieved through git aliases. 

Scripts that replace git commands ( such as ```checkout``` ) attempt to act like _superset_ commands, meaning that the ```checkout``` command can be used as the git equivalent. This is still not the case for all commands though. 

## Install

Run:

```npm install -g ngit-cli``` 

in your terminal to install the package globally. You can then use the program using the ```ngit-cli``` in the terminal. As this can be a bit verbose, it is recommended to [create an alias](https://linuxhint.com/configure-use-aliases-zsh/) for it, such as ```ngit```. 

You will then be able to use the ```ngit``` command similarly to git for the supported commands (see below) in any repo.

### checkout
Works like checkout but prints out a selectable list if no parameters are passed. 

![ngit checkout screenshot](https://i.imgur.com/qnNyK3s.png)

Add the `--my` flag to only show your branches. It might be a bit approximate though, but it will remove master ( or main ), release branches and mr branches from other users.
Branches are sorted by the date of the last commit.

### erase
Shows a selectable list of branches can delete. By default, it only deletes local branches but you can pass the ```--all``` or ```-a``` flag to also delete the branch(es) in the remote. This list is a multiselect, which allows deleting multiple branches at once. 

![ngit erase](https://i.imgur.com/OIycm9j.png)

Branches are sorted by the creation date of the branch.

#### Flags
 - ```--all``` or ```-a```: to also delete the branch in the remote. 
 - ```--gone``` or ```-g```: to only show branches with a remote status of ```Gone``` (meaning the remote branch was deleted)

__Warning__: currently the script can't erase the remote branch if it has a different name than the local branch

### stash
Differs from the usual ```git stash``` command as no passing any arguments will print out the modified files (```git status```). You can then select the files that you want to stash.

![ngit stash](https://i.imgur.com/7GEW77X.png)

#### Flags
 - ```-m```: similar to ```git stash push```, you can label your stash entry with ```ngit stash -m <some-message>```

### add
Similar to ```ngit stash```. Will print out a selectable list of files to stage. 

![ngit add](https://i.imgur.com/ol6s6Bj.png)


## To do

I plan on adding more commands such as : 
 - restore
 - cherry-pick

The scripts I make here are the ones I feel I'm missing when using git through the cli.

## Contribution and feedback

Still very early days, so no contribution guide. But if you want to contribute or share some [feedback](https://www.youtube.com/watch?v=zi8ShAosqzI).