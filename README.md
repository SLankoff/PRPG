# pkrpg
The Pokemon RPG, built out of Custom System Builder for Foundry - Now Updated for V11!

## Requirements
Foundry V11 (build 307 verified) , [Custom System Builder(2.3+)](https://gitlab.com/custom-system-builder/custom-system-builder), [The Warpgate Module](https://github.com/trioderegion/warpgate)
## Changes
Wow, lots to list here. I've gone and made a handful of improvements to the base of a handful of sheets to accommodate some new QoL functions, said functions definitely being the star of the show this update!
These are all kind of hacky, and if you encounter any issues let me know because it wouldn't surprise me.
A quick list of what I can think of that's been added, in no particular order:
1) Automatic Initiative Tracking
2) Overhauled Move Usage
3) Updated/Improved Battle Dialog
4) Party display tab on trainers (who are player characters)
5) Player Pokemon Box system
6) Quick Reset Button on Pokemon
7) Shift+Click prompts to roll attacks and skills with advantage/disadvantage

## Automatic Initaitive Tracking
When adding a combatant to a combat (typically by right clicking a token and toggling their combat state),
the GM will receive this screen to configure the combatant.

![Initiative Select Menu](https://cdn.discordapp.com/attachments/723454625671282704/1140163046094938192/image.png)

Clicking submit without the checkbox doubles the combatant's speed and updates it as their initiative, like a solo Pokemon.
Selecting a party will average their speed values and add it to the trainer's, updating their initiative in the process.
The combatant's active party will also be shown in the combat tracker, like so:

![Combat Tracker Shot](https://github.com/SLankoff/PRPG/assets/127635228/396d28c2-b070-4396-ad66-4259cec594e5)

At any point if you wish to change the active party for a given combatant, you may right-click them on the combat tracker and use the new "Update Party" Button!

![Update Party Context Button](https://github.com/SLankoff/PRPG/assets/127635228/3daf9f4f-1bcf-49df-96bc-d3108a4005b5)

Which brings up a similar dialog as before, with the option to update the calculated initiative right away or to wait for the next round to do so automatically.

![Initiative Menu Again](https://github.com/SLankoff/PRPG/assets/127635228/61df2ab3-867e-4a09-af47-8e9bfcb7f469)


Lastly, as mentioned, on each new round the initiative will update again reading the speed values of the party in case they've been updated!

## Overhauled Move Usage
When a move is added to a Pokemon Sheet, you'll now see a 'Use' Button that prints a message into chat with buttons for interactivity.
This message respects your roll mode choice, so it's easy to change who can see it.

![Move Usage Example](https://github.com/SLankoff/PRPG/assets/127635228/b95a9dd0-bf59-4ca7-9061-c8aa92c77ee9)

(It should be noted that values and stats are pulled at the time of clicking the button, so if anything changes on the host's moves you need not post a new message.)
Furthermore, shift clicking on "Roll Attack" prompts specification on advantage or disadvantage.

![Roll Specification](https://github.com/SLankoff/PRPG/assets/127635228/ae6fa093-aa53-406c-b836-3d03582eb5cc)

And, the best reason to require installing Warpgate, measured templates!
If a move has an AOE specified, (Line, Burst, Cone), this button will generate to help you visualize that move's range, and when you're ready, place it on the scene.

![Measured Template use](https://github.com/SLankoff/PRPG/assets/127635228/b96b7401-0dc3-4b5e-94ca-f05e6da21c56)

## Improved Battle Dialog
Speaking of using moves, adding up damage has never been easier!
As a GM, select a token to function as an attacker (and optionally you may also specify the defender right away by targeting them) and run the Definitive Battle Dialog macro, included in the world (and upgrade materials!)

![Battle Dialog](https://github.com/SLankoff/PRPG/assets/127635228/2603ca79-36e7-41c3-abf4-3e85c3d74d54)

Lots of useful features are plainly evident, such as stats at a glance and the ability to roll attacks without leaving the dialog, but there are some great features not as obvious:

Clicking on an attacker or defender's portrait invokes Warpgate to pick a new token on the canvas to select in that place.

![image](https://github.com/SLankoff/PRPG/assets/127635228/4ddc3aa6-691d-4123-b98d-089f2436c3ff)

While right-clicking on them simply brings up their character sheet for a quick review.

You can also drag a move onto the dialog to use it for the moment without teaching it to the Pokemon.

![Magneton used Roar of Time!](https://github.com/SLankoff/PRPG/assets/127635228/9f3a735f-9fd9-42bc-9bee-7bad8f55c240)

The multiplier, stat, and type values should fill in automatically based on the move and who's defending against it, but in the event that they're changed, that change is used.

## Party Tab on Trainers (Who are Player Characters)
If a user has a (trainer) character assigned to them and their party folder configured for Box Operations (See that section for more)
That trainer will display the Pokemon in their party folder like so:

![Party Tab](https://github.com/SLankoff/PRPG/assets/127635228/a6681571-b567-4d66-bd24-3801a1c49145)

Clicking on any of the party members shows their character sheet for quick reference as well.

## Player Pokemon Box System
You can now configure Actor Folders as Box and Party folders for the purpose of automatically sorting which Pokemon are with a player on the field and which are stored safely in the box!
Right click either a user:

![User Context Example](https://github.com/SLankoff/PRPG/assets/127635228/9d90fa9b-869a-4b37-9d0e-c4d9d65e066a)

Or an Actor Folder:

![Folder Context Example](https://github.com/SLankoff/PRPG/assets/127635228/4de5fd16-f47d-4212-83d4-9fe0911c1830)

And follow the prompts as necessary for first-time setup.

![User Context First time Setup](https://github.com/SLankoff/PRPG/assets/127635228/9206eb46-f9b8-490f-9f00-9bc422428fd3)

(Which, of course, Folder IDs can be copied from the "Edit Folder" menu)

![image](https://github.com/SLankoff/PRPG/assets/127635228/04444085-d38b-4169-acbc-18080a97e8d4)

Once configured, the user context will list every Pokemon that the user has ownership permissions on and allow you to pick up to 6 to keep in your specified party folder. The rest will be safely tucked away into the configured box folder.

![Box Operations Example](https://github.com/SLankoff/PRPG/assets/127635228/d5da4721-4469-4db7-819b-ac0ee261ca48)

## Reset Button on Pokemon Sheets
A tiny but speedy feature is the new reset button present on all Pokemon Character sheets. 
Does what it says on the tin, resetting the combat stages (except for Accuracy and Evasion, sorry!) and health of the Pokemon shown.

![Reset Button](https://github.com/SLankoff/PRPG/assets/127635228/88057724-335e-423b-8538-e3fad50951e1)



## Installation

In the "Install world" prompt in Foundry, insert the manifest URL

https://raw.githubusercontent.com/SLankoff/PRPG/main/world.json


## Updating a previous instance
So, I have no reason to believe anyone has ever used this for themself...

But if you have, I put together some resources for helping you update to the new version!
Before touching any of this PLEASE BACK UP YOUR DATA!
I've tested everything here a bunch of times but I can't account for everything so please back your data up in case something happens.

Start by importing [the following as a script macro.](https://raw.githubusercontent.com/SLankoff/PRPG/updatetemplates/updatemacro) It will:
1) Update your Pokemon, Trainer, and Move Templates to the latest version
2) Update the moves of every actor in the world, as well as on the sidebar to use the new tiered damage system
3) Reloads all of those templates to be up to date!

You will then need to manually install the [updated css sheet](https://raw.githubusercontent.com/SLankoff/PRPG/main/assets/types.css), which you can find in your data directory prpg > assets. and configure [the new pokeutils.js](https://raw.githubusercontent.com/SLankoff/PRPG/main/assets/pokeutils.js) as a world script. Instructions for installing world scripts can be found [here](https://foundryvtt.wiki/en/basics/world-scripts)!


