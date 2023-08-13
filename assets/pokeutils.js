//CONFIG.debug.hooks = true;
const damageTiers = {
  1: "1d10",
  2: "1d12",
  3: "2d6",
  4: "2d8",
  5: "2d12",
  6: "4d8",
  7: "4d12",
  8: "3d10*2",
  9: "3d12*2",
  10: "4d10*2",
  11: "4d12*2",
  12: "5d10*2",
  13: "3d12*3",
  14: "5d12*2",
  15: "5d8*3",
  16: "8d8*2",
  17: "6d12*2",
  18: "6d6*4",
  19: "5d8*4",
  20: "6d10*3",
  21: "8d8*3",
  22: "6d12*3"
}
const pokemonTemplate = "CX7P8uL1P23qe19j"
//Create Combatant Initiative Menu
Hooks.on("createCombatant", (combatant) => {
async function showDialog() {
    return new Promise((resolve, reject) => {
      let checkboxChecked = false;
      let selectedTokens = [];
  
      const style = document.createElement("style");
      style.innerHTML = `
        .token-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
  
        .token-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 20%;
        }
  
        .token-icon {
          display: block;
          margin-bottom: 4px;
          max-width: 64px;
          max-height: 64px;
        }
      `;
      document.head.appendChild(style);
  
      new Dialog({
        title: "Pokemon Initiative Menu",
        content: `
          <div>
            <label for="checkbox">Has a Party:</label>
            <input type="checkbox" id="checkbox" name="checkbox">
          </div>
          <div id="token-list" style="display: none;">
            <label for="token-checkboxes">Pokemon on this scene:</label>
            <div class="token-list" id="token-checkboxes"></div>
          </div>
        `,
        buttons: {
          submit: {
            label: "Submit",
            icon: '<i class="fa-solid fa-forward"></i>',
            callback: () => {
              resolve({ checkboxChecked, selectedTokens });
            },
          },
          cancel: {
            label: "Cancel",
            callback: () => {
              reject();
            },
          },
        },
        render: (html) => {
          const checkboxElement = document.getElementById("checkbox");
          const tokenListElement = document.getElementById("token-list");
          const tokenCheckboxesElement = document.getElementById("token-checkboxes");
  
          checkboxElement.addEventListener("change", () => {
            if (checkboxElement.checked) {
              tokenListElement.style.display = "block";
            } else {
              tokenListElement.style.display = "none";
            }
          });
  
          const filteredTokens = game.canvas.scene.collections.tokens.filter((token) => {
            const template = getProperty(token, "actor.system.template");
            return template === pokemonTemplate
          });
  
          filteredTokens.forEach((token, index) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = "token-checkbox";
            checkbox.value = token.id;
  
            checkbox.addEventListener("change", () => {
              if (checkbox.checked) {
                selectedTokens.push(token);
              } else {
                const index = selectedTokens.findIndex((selectedToken) => selectedToken.id === token.id);
                if (index !== -1) {
                  selectedTokens.splice(index, 1);
                }
              }
            });
  
            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(token.name));
  
            const icon = document.createElement("img");
            icon.src = token.texture.src;
            icon.classList.add("token-icon");
  
            const entry = document.createElement("div");
            entry.classList.add("token-entry");
            entry.appendChild(icon);
            entry.appendChild(label);
  
            tokenCheckboxesElement.appendChild(entry);
          });
        },
        default: "submit",
        close: () => {
          reject();
        },
      }, { height: "auto !important", width: "auto !important" }).render(true);
    });
  }
  
  async function addCombatant() {
    const result = await showDialog();
    if (result && result.selectedTokens.length > 0) {
      let actor = game.canvas.scene.collections.tokens.get(combatant.tokenId).actor;
      let SPD = Number(actor.system.props.SPD)
const sum = result.selectedTokens.reduce((accumulator, obj) => {
    const value = parseFloat(getProperty(obj, "actor.system.props.SPD")); // Parse the string as a float
  return accumulator + value;
}, 0);
const average = sum / result.selectedTokens.length;
const actorIds = result.selectedTokens.map(obj => obj.id);
await combatant.update ({initiative: (average + SPD )})
await combatant.update ({flags: {"party": actorIds}})
    } else {
      let actor = game.canvas.scene.collections.tokens.get(combatant.tokenId).actor;
      let SPD = Number(actor.system.props.SPD)

     await combatant.update ({initiative: (SPD * 2)})
    }
  }
  if (game.user.isGM) {
  addCombatant();
  }
})
//Update Party Initiative per round
Hooks.on("combatRound", (combat) => {
   async function separateByPartyFlag(obj) {
        const withPartyFlag = [];
        const withoutPartyFlag = [];
      
        for (const item of combat.combatants.contents) {
            if (item.flags.party) {
              withPartyFlag.push(item);
            } else {
              withoutPartyFlag.push(item);
            }
          }
      
        return {
          withPartyFlag,
          withoutPartyFlag
        };
      }
      
      const result = separateByPartyFlag(combat);
      result.then((resolvedResult) => {
        async function calculateAverageSPD(ids) {
          const resolvedValues = await Promise.all(
            ids.map(async (id) => {
              const token = await game.canvas.scene.collections.tokens.get(id);
              return token ? Number(token.actor.system.props.SPD) : 0;
            })
          );
        
          const sum = resolvedValues.reduce((acc, spd) => acc + spd, 0);
          const average = sum / resolvedValues.length;
          return average;
        }
        
        async function processWithPartyFlagArray(withPartyFlagArray) {
          for (const item of withPartyFlagArray) {
            if (item.flags && item.flags.party && Array.isArray(item.flags.party)) {
              item.flags.party.forEach(id => {
                if (!game.canvas.scene.collections.tokens.get(id)){
                  console.log(`Token id ${id} not found on canvas probably`)
                }
              })
              const averageSPD = await calculateAverageSPD(item.flags.party);
              await item.update ({initiative: (averageSPD + Number(item.actor.system.props.SPD))})
            }
          }
        }
        async function processWithoutPartyFlagArray(withoutPartyFlagArray) {
          for (const item of withoutPartyFlagArray) {
            if (item.actor && item.actor.system && item.actor.system.props && item.actor.system.props.SPD) {
              const spd = Number(item.actor.system.props.SPD);
              const result = spd * 2;
              await item.update ({initiative: result})
            }
          }
        }
        processWithPartyFlagArray(resolvedResult.withPartyFlag);     
        processWithoutPartyFlagArray(resolvedResult.withoutPartyFlag);
      });
    
 
})
//Add 'Update Party' Button
Hooks.on('getCombatTrackerEntryContext', (html, menuItems) => {
    menuItems.push({
        callback: async (li) => {
            const combatantId = $(li).data('combatant-id');
            let combatant = game.combat.combatants.get(combatantId)
            async function showDialog() {
                return new Promise((resolve, reject) => {
                  let checkboxChecked = false;
                  let selectedTokens = [];
              
                  const style = document.createElement("style");
                  style.innerHTML = `
                    .token-list {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 5px;
                    }
              
                    .token-entry {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      text-align: center;
                      width: 20%;
                    }
              
                    .token-icon {
                      display: block;
                      margin-bottom: 4px;
                      max-width: 64px;
                      max-height: 64px;
                    }
                  `;
                  document.head.appendChild(style);
              
                  new Dialog({
                    title: "Pokemon Initiative Menu",
                    content: `
                      <div>
                        <label for="checkbox">Update Initiative Immediately?:</label>
                        <input type="checkbox" id="checkbox" name="checkbox">
                      </div>
                      <div id="token-list">
                        <label for="token-checkboxes">Pokemon on this scene:</label>
                        <div class="token-list" id="token-checkboxes"></div>
                      </div>
                    `,
                    buttons: {
                      submit: {
                        label: "Submit",
                        icon: '<i class="fa-solid fa-forward"></i>',
                        callback: () => {
                          resolve({ checkboxChecked, selectedTokens });
                        },
                      },
                      cancel: {
                        label: "Cancel",
                        callback: () => {
                          reject();
                        },
                      },
                    },
                    render: (html) => {
                      const checkboxElement = document.getElementById("checkbox");
                      const tokenListElement = document.getElementById("token-list");
                      const tokenCheckboxesElement = document.getElementById("token-checkboxes");
                      checkboxElement.addEventListener("change", () => {
                        checkboxChecked = checkboxElement.checked;
                      });
              
                      const filteredTokens = game.canvas.scene.collections.tokens.filter((token) => {
                        const template = getProperty(token, "actor.system.template");
                        return template === pokemonTemplate
                      });
              
                      filteredTokens.forEach((token, index) => {
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.name = "token-checkbox";
                        checkbox.value = token.id;
              
                        checkbox.addEventListener("change", () => {
                          if (checkbox.checked) {
                            selectedTokens.push(token);
                          } else {
                            const index = selectedTokens.findIndex((selectedToken) => selectedToken.id === token.id);
                            if (index !== -1) {
                              selectedTokens.splice(index, 1);
                            }
                          }
                        });
              
                        const label = document.createElement("label");
                        label.appendChild(checkbox);
                        label.appendChild(document.createTextNode(token.name));
              
                        const icon = document.createElement("img");
                        icon.src = token.texture.src;
                        icon.classList.add("token-icon");
              
                        const entry = document.createElement("div");
                        entry.classList.add("token-entry");
                        entry.appendChild(icon);
                        entry.appendChild(label);
              
                        tokenCheckboxesElement.appendChild(entry);
                      });
                    },
                    default: "submit",
                    close: () => {
                      reject();
                    },
                  }, { height: "auto !important", width: "auto !important" }).render(true);
                });
              }
              async function addCombatant() {
                const result = await showDialog();
                if (result && !result.selectedTokens)
                {
                  return
                }
                if (result && result.selectedTokens.length > 0) {
                  let actor = game.canvas.scene.collections.tokens.get(combatant.tokenId).actor;
                  let SPD = Number(actor.system.props.SPD)
            const sum = result.selectedTokens.reduce((accumulator, obj) => {
                const value = parseFloat(getProperty(obj, "actor.system.props.SPD"));
              return accumulator + value;
            }, 0);
            const average = sum / result.selectedTokens.length;
            const actorIds = result.selectedTokens.map(obj => obj.id);
            if (result.checkboxChecked)
            {
            await combatant.update ({initiative: (average + SPD )})
            }
            await combatant.update ({flags: {"party": actorIds}})
                } else {
                  let actor = game.canvas.scene.collections.tokens.get(combatant.tokenId).actor;
                  let SPD = Number(actor.system.props.SPD)
            
                 await combatant.update ({initiative: (SPD * 2)})
                 await combatant.update ({flags: {"party": null}})

                }
              }
                         addCombatant();

        },
        condition: game.user.isGM,
        icon: '<i class="fa-duotone fa-dragon"></i>',
        name: "Update Party"

    })
})
//Display Active Pokemon in Combat Tracker
Hooks.on('renderCombatTracker', () => {
  // Get the parent element
  const parentElement = document.querySelector('#combat-tracker.directory-list');
  
  // Get all the <li> elements within the parent element
  const liElements = parentElement.querySelectorAll('li');
  
  // Iterate over each <li> element
  liElements.forEach(liElement => {
  
    // Get the existing <img> element
    const existingImgElement = liElement.querySelector('.token-image');
  const combatantId = $(liElement).data('combatant-id')
  const combatant = game.combat.combatants.get(combatantId)
  if (combatant.flags.party && canvas.scene)
  {
    combatant.flags.party.forEach(async tokenID =>
      {
        if (game.canvas.scene.collections.tokens.get(tokenID)) {
  const token = game.canvas.scene.collections.tokens.get(tokenID)
    const newImgElement = document.createElement('img');
    newImgElement.src = token.texture.src;
    newImgElement.className = "party-image"
  
    // Insert the new <img> element after the existing <img> element
    existingImgElement.after(newImgElement)
        }
        else {
          let found = combatant.flags.party.indexOf(tokenID)
      combatant.flags.party.splice(found, 1)
      if (combatant.flags.party.length == 0) {
      await combatant.update({flags: {"party": null}})
      }
      else {
        await combatant.update({flags: {"party": combatant.flags.party}}) 
      }
      }
      })
  }})
  });
  //Add Box Operations to Users Context
  Hooks.on("getUserContextOptions", (html, menuItems) => {
    menuItems.push({
        callback: async li => {
          let selfuser = game.users.get(li.data("user-id"))
          async function showDialog() {
            return new Promise((resolve) => {
           new Dialog({
              title: "First Time Setup",
              content: `
                <p>Your Party and Box Folders haven't been assigned, please input their IDs!:</p>
                <div>
                  <label for="input1">Party Folder:</label>
                  <input id="input1" type="text">
                </div>
                <div>
                  <label for="input2">Box Folder:</label>
                  <input id="input2" type="text">
                </div>
              `,
              buttons: {
                ok: {
                  label: "OK",
                  callback: (html) => {         
               let inputValue1 = html.find("#input1")[0].value;
                    let inputValue2 = html.find("#input2")[0].value;
                    let update1 = {"flags":  { "partyfolder": inputValue1 }};
          let update2 = {"flags":  { "boxfolder": inputValue2 }};
           selfuser.update(update1);
          selfuser.update(update2);
          resolve();
          }
                }
              }
            }).render(true);
            });
          }
          if (selfuser.flags.partyfolder === undefined) {
            // show first dialog box and wait for input
            await showDialog();
            
            // Update this to be character agnostic!! done probably
        }
          let total = game.actors.filter(a => a.ownership[selfuser.id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER  && a.system.template == pokemonTemplate);
  
          let optionsHtml = Object.values(total).map(option => `
              <input type="checkbox" class="option" id="${option.id}" value="${option.id}" />
              <label for="${option.id}"><img src="${option.img}" style="width:50px;height:50px" />${option.name}</label>
          `).join('');
              
          new Dialog({
            title: "Select Options",
            content: `
              <div class="boxoperations">
                <p>Select up to 6 Pokemon for your party:</p>
                <div id="options">
                  ${optionsHtml}
                </div>
              </div>
            `,
            render: () => {
                    let style = document.createElement("style");
style.type = "text/css";
style.innerHTML = `
  .boxoperations {
font-family: PokemonGB;
resize: both;
    overflow: auto;
    max-height: calc(100vh - 200px);
    max-width: calc(100vw - 200px);
    padding: 10px;
    box-sizing: border-box;
  }
  
  #options {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .option {
    display: none;
  }
  
  .option + label {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: calc(33.33% - 10px);
    margin: 5px;
    cursor: pointer;
    border: 1px solid black;
  }
  
  .option:checked + label {
    background-color: lightblue;
  }

  @media (max-width: 767px) {
    .option + label {
      width: calc(50% - 10px);
    }
  }

  @media (max-width: 479px) {
    .option + label {
      width: 100%;
    }
  }
`;
document.head.appendChild(style);
            },
            buttons: {
              select: {
                label: "Select",
                callback: (html) => {   
          let allOptions = Object.values(total).map(option => option.id);
                  let selectedOptions = Array.from(html.find("input[type=checkbox]:checked")).map(option => option.value);
                  if (selectedOptions.length <= 6) {
                    let remainingOptions = allOptions.filter(option => !selectedOptions.includes(option));
                    
          selectedOptions.forEach(option =>  {
          let testactor = game.actors.get(option);
          let update1 = {"folder": selfuser.flags.partyfolder};
          testactor.update(update1)
          }); 
                remainingOptions.forEach(option =>  {
          let testactor = game.actors.get(option);
          let update1 = {"folder": selfuser.flags.boxfolder};
          testactor.update(update1)
          });
                  } else {
                    ui.notifications.error("You may only carry 6 Pokemon!");
                  }
                }
              },
              cancel: {
                label: "Cancel"
              },
            },
            default: "select"
          }).render(true);
  document.head.appendChild(style);
  
        },
        condition: li => (game.users.get(li.data("user-id")).isGM == false),
        icon: '<i class="fa-duotone fa-computer-classic"></i>',
        name: 'User Box Configuration'
    });
  })
  //Add Box Operations to Folders Context
  Hooks.on("getActorDirectoryFolderContext", (html, menuItems) => {
    menuItems.push({
        callback: async header => {
          const li = header.parent();
          const folder = game.folders.get(li.data("folderId"));
          async function showDialog2() {
            return new Promise((resolve) => {
          let total = game.users.filter(a => a.isGM ===false);
          let optionsHtml = Object.values(total).map(option => `
              <input type="radio" class="option" name="user-button" id="${option.id}" value="${option.id}" />
              <label for="${option.id}">${option.name}</label>
          `).join(''); 
          new Dialog({
              title: "DM: Select User",
              content: `
                <p>Please select a user to perform Box Operations with...</p>
                <div>
          <div id="options">
                  ${optionsHtml}
                  <div id ="options2">
                  <input type="radio" class="option" name="partybox" id="party" value="party" />
                  <label for="party">Assign as Party</label>
                  <input type="radio" class="option" name="partybox" id="box" value="box" />
                  <label for="box">Assign as Box</label>
                </div>
                </div>
              `,
              buttons: {
                ok: {
                  label: "OK",
                  callback: async (html) => {         
                  let selected = html.find('input[type="radio"][name="user-button"]:checked').map(function() {
                    return this.id
                  }).get().join();
                  let selected2 = html.find('input[type="radio"][name="partybox"]:checked').map(function() {
                    return this.id
                  }).get().join();
          let selfuser = game.users.get(selected);
 if (selected2 == 'box'){
  await selfuser.update({flags: {boxfolder: folder.id}})
  ui.notifications.info("User "+selfuser.name+" Box Folder Updated!");
 }
 if (selected2 == 'party') {
  await selfuser.update({flags: {partyfolder: folder.id}})
  ui.notifications.info("User "+selfuser.name+" Party Folder Updated!");
 }
          resolve();
          }
                }
              }
            }).render(true);
            });
          }
          await showDialog2();
        },
        condition: game.user.isGM,
        icon: '<i class="fa-duotone fa-computer-classic"></i>',
        name: 'Assign for Box Operations'
    });
  })
       //Add Custom Elements to Character Sheets
       Hooks.on("renderCustomActorSheet", async (sheet) => {
        let usedarray = []
        let obj = sheet.object;
        let parentElement = sheet.element[0]
        const useButtonElement = parentElement.querySelectorAll('.usebutton');
        if (useButtonElement) {
          const style = document.createElement("style");
        style.innerHTML = `
         [class*="usebutton"] > button {
        font-family: PokemonGB;
          }`
          parentElement.appendChild(style)
          useButtonElement.forEach(element => {
            
          
        const buttonElement = document.createElement('button');
        buttonElement.textContent = 'Use';
      
        
        buttonElement.addEventListener('click', async function() {
          let rowcontainer = element.parentElement.parentElement;
          let itemEntry = rowcontainer.querySelector('[data-id]')
          let workingitem = obj.items.get(itemEntry.dataset.id);
          let buttonArray = [];
          if (workingitem.system.props.modifier != "") {
             buttonArray.push("prpg-atkroll")
          }
          if (workingitem.system.props.damage !="") {
             buttonArray.push("prpg-dmgroll")
          }
          if (workingitem.system.props.moverange.includes("Burst") || workingitem.system.props.moverange.includes("Line") || workingitem.system.props.moverange.includes("Cone")){
             buttonArray.push("prpg-aoe")
           }
           if (buttonArray) {
              buttonArray = buttonArray.map( (item) => {
                  let label = ""
                  if (item == "prpg-atkroll") {
                        label = "Roll Attack"
                  }
                  if (item == "prpg-dmgroll") {
                        label = "Roll Damage"
                  }
                  if (item == "prpg-aoe") {
                        label = "Place Measured Template"
                  }
                  return `<button class="prpgbutton" data-prpg-action="${item}" data-uuid=${workingitem.uuid}>${label}</button>`
              })
           }
          let chatContent = {
                   content: `<div class="prpg-usedmove" style="font-family:PokemonGB"><h3>${workingitem.name} <br><img src=${workingitem.img} style="width:35px;height:35px;border:none" alt="Move Image" title="${workingitem.system.props.kind}"</img><span class="type ${workingitem.system.props.type.toLowerCase()}" style="font-size:9px;display:inline-block;text-align:right;margin-left:45%"> </span></h3><div id="moveinfo"> ${workingitem.system.props.effect}</div><br>${buttonArray.join("<br>")}</div>`,
              speaker:ChatMessage.getSpeaker({actor: obj, alias: obj.prototypeToken.name }),
              type: CONST.CHAT_MESSAGE_TYPES.ROLL
                };
        ChatMessage.create(chatContent);
        });
        element.appendChild(buttonElement);
      });
        
          }
          const resetButtonElement = parentElement.querySelector('.resetbutton');
    if (resetButtonElement) {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = 'Reset Combat Stages/Health';
    const style = document.createElement("style");
    style.innerHTML = `
     [class*="resetbutton"] > button {
    font-family: PokemonGB;
      }`
    
    buttonElement.addEventListener('click', async function() {
      Dialog.confirm({
        title: "Are you sure you want to reset?",
        content: "<p>Really reset this Pokemon's CS and Health?</p>",
        yes: async () =>{        let maxHP = obj.system.props.maxHP;
          await obj.update({"system.props.currentHP": maxHP, "system.props.ATKmod": "1", "system.props.DEFmod": "1", "system.props.SAtkmod": "1", "system.props.SDEFmod": "1", "system.props.SPDmod": "1"})
           },
        no: () => {},
        defaultYes: false
       });
    });
    parentElement.appendChild(style)
    resetButtonElement.appendChild(buttonElement);
      }
      if (obj.system.template != pokemonTemplate)
      {
    const targetCharacterId = obj.id;
    for (const userindex in game.users.contents) {
      const user = game.users.contents[userindex]
      if (user.character && user.character.id === targetCharacterId && user.flags.partyfolder) {
    console.log(user.flags.partyfolder);
    
    const folderId = user.flags.partyfolder;
    const actors = game.actors.filter(actor => actor.folder?.id === folderId);
    
    const parentElement = document.querySelectorAll('[class*="partyelement"]')[0];
    const style = document.createElement("style");
    style.innerHTML = `
     [class*="partyelement"] > button {
        display: flex;
        flex-direction: column;
        text-align: center;
    align-items: center;
    font-family: PokemonGB;
    width: 25%;
      }
      progress {
        border: 1px solid #ccc;
                }
                progress::-webkit-progress-value {
                    background-color:green;
                }
        
                progress::-webkit-progress-bar {
                    background-color: red;
                }`
    parentElement.appendChild(style)
    
    actors.forEach(async actor => {
      const button = document.createElement("button");
      const additionalText = document.createElement("span");
      const healthBar = document.createElement("progress");
      button.textContent = actor.name;
      additionalText.textContent = "Level "+actor.system.props.clevel;
      healthBar.value = actor.system.props.currentHP;
      healthBar.max = actor.system.props.maxHP;
      healthBar.className = "healthBar";
    
      button.addEventListener("click", async () =>  {
        actor.sheet.render(true)
      });

      const image = document.createElement("img");
      image.src = actor.img;
    
      button.appendChild(image);
      button.appendChild(additionalText);
      button.appendChild(healthBar);
      parentElement.appendChild(button);
    });
      }
    }
      
     }
     
     //Block for making shift+click advantage goes here
        })
          //Add Hooks for Use Buttons
          Hooks.on("renderChatMessage", (meta, html) => {
            html[0].querySelectorAll("button[data-prpg-action]").forEach(async i => {
              if (await fromUuid(i.dataset.uuid)) {
                let workingitem = await fromUuid(i.dataset.uuid)
                if (workingitem.isOwner == false){
                i.hidden = true;
                }
              }
              i.addEventListener("click", async (event) => {
                if (i.dataset.prpgAction == "prpg-atkroll") {
                  if (!await fromUuid(i.dataset.uuid)) {
                    return ui.notifications.error(`Move UUID ${i.dataset.uuid} not found on source actor!`)
                  }
                  let workingitem = await fromUuid(i.dataset.uuid);
                  let obj = workingitem.parent;
                  let statbonus = 0;
                  if (workingitem.system.props.kind == "Physical") {
                     statbonus = math.floor((obj.system.props.ATK) / 10);
                  
                  }
                  else if (workingitem.system.props.kind == "Special") {
                     statbonus = math.floor((obj.system.props.SAtk) / 10);
                  
                  }
                  else if (workingitem.system.props.kind == "Status") {
                    statbonus = math.floor(obj.system.props.SAtk > obj.system.props.ATK ? (obj.system.props.SAtk) / 10 : (obj.system.props.ATK)  / 10);
                 
                 }
                 if (event.shiftKey) {
                  let d2 = await new Dialog({
                    title: `Rolling Attack - ${workingitem.name}`,
                    content: `<p>Would you like to roll with Advantage, Disadvantage, or normally?</p>`,
                    buttons: {
                        one: {
                            icon: '<i class="fa-solid fa-dice-d20" style="color: #00ff00;"></i>',
                            label: "Advantage",
                            callback: async  () => {
                              let r = await new Roll(`2d20kh+${statbonus}+(${workingitem.system.props.modifier})+(${obj.system.props.accuracy})`).roll({async:true});
                              let chatData = {
                                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                                rolls: [r],
                                content: "",
                                speaker: ChatMessage.getSpeaker({actor: obj, alias:obj.prototypeToken.name}),
                                flavor: `${obj.name}'s ${workingitem.name} - Attack Roll (Advantage)`
                                //etc.
                             };
                             ChatMessage.applyRollMode(chatData, "roll");
                             ChatMessage.create(chatData);



                            }
                              
                        },
                        two: {
                            icon: '<i class="fa-light fa-dice-d20"></i>',
                            label: "Normal",
                            callback: async () => {
                              let r = await new Roll(`1d20+${statbonus}+(${workingitem.system.props.modifier})+(${obj.system.props.accuracy})`).roll({async:true});
                              let chatData = {
                                type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                                rolls: [r],
                                content: "",
                                speaker: ChatMessage.getSpeaker({actor: obj, alias:obj.prototypeToken.name}),
                                flavor: `${obj.name}'s ${workingitem.name} - Attack Roll`
                                //etc.
                             };
                             ChatMessage.applyRollMode(chatData, "roll");
                             ChatMessage.create(chatData);
                          
                          
                          
                          }
                        },
                        three: {
                          icon: '<i class="fa-duotone fa-dice-d20" style="--fa-primary-color: #ff0000; --fa-secondary-color: #ff0000;"></i>',
                          label: "Disadvantage",
                          callback: async () => {
                            let r = await new Roll(`2d20kl+${statbonus}+(${workingitem.system.props.modifier})+(${obj.system.props.accuracy})`).roll({async:true});
                            let chatData = {
                              type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                              rolls: [r],
                              content: "",
                              speaker: ChatMessage.getSpeaker({actor: obj, alias:obj.prototypeToken.name}),
                              flavor: `${obj.name}'s ${workingitem.name} - Attack Roll (Disadvantage)`
                              //etc.
                           };
                           ChatMessage.applyRollMode(chatData, "roll");
                           ChatMessage.create(chatData);
                        
                        
                        
                        }
                      }
                    },
                    default: "two"
                }).render(true)
                 }
                 else {
                      let r = await new Roll(`1d20+${statbonus}+(${workingitem.system.props.modifier})+(${obj.system.props.accuracy})`).roll({async:true});
                      let chatData = {
                        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                        rolls: [r],
                        content: "",
                        speaker: ChatMessage.getSpeaker({actor: obj, alias:obj.prototypeToken.name}),
                        flavor: `${obj.name}'s ${workingitem.name} - Attack Roll`
                        //etc.
                     };
                     ChatMessage.applyRollMode(chatData, "roll");
                     ChatMessage.create(chatData);
                    }
                }
                if (i.dataset.prpgAction == "prpg-dmgroll") {
                  if (!await fromUuid(i.dataset.uuid)) {
                    return ui.notifications.error(`Move UUID ${i.dataset.uuid} not found on source actor!`)
                  }
                  let workingitem = await fromUuid(i.dataset.uuid);
                  let obj = workingitem.parent;
          let currentTier = damageTiers[Number(workingitem.system.props.damage)]
                      let r = await new Roll(`${currentTier}`).roll({async:true});
            let chatData = {
               type: CONST.CHAT_MESSAGE_TYPES.ROLL,
               speaker: ChatMessage.getSpeaker({actor: obj, alias: obj.prototypeToken.name}),
               rolls: [r],
               content: "",
               flavor: `${obj.name}'s ${workingitem.name} - Damage Roll`
               //etc.
            };
            ChatMessage.applyRollMode(chatData, "roll");
            ChatMessage.create(chatData);
                }
                if (i.dataset.prpgAction == "prpg-aoe") {
                  if (!await fromUuid(i.dataset.uuid)) {
                    return ui.notifications.error(`Move UUID ${i.dataset.uuid} not found on source actor!`)
                  }
                  let aoedata =  {};
                  let workingitem = await fromUuid(i.dataset.uuid);
                  let obj = workingitem.parent;
                  if (workingitem.system.props.moverange.includes("Burst"))
                  {
                     aoedata = {
                      range: workingitem.system.props.moverange.match(/(?<=Burst\s*)\d+/),
                      shape: "circle"
                    }
                  }
                  if (workingitem.system.props.moverange.includes("Cone"))
                  {
                    aoedata = {
                      range: workingitem.system.props.moverange.match(/(?<=Cone\s*)\d+/),
                      shape: "cone"
                    }
                  }
                  if (workingitem.system.props.moverange.includes("Line"))
                  {
                    aoedata = {
                      range: workingitem.system.props.moverange.match(/(?<=Line\s*)\d+/),
                      shape: "ray"
                    }
                  }
                  let locationtarget = await warpgate.crosshairs.show({
                    size: aoedata['range']*2,
                    label: workingitem.name, 
                    t: aoedata['shape'],
                    drawIcon: false
                  })
                  if (!locationtarget.cancelled) {
                  await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [{
                    t: aoedata['shape'],
                    user: game.user.id,
                    x: locationtarget.x,
                    y: locationtarget.y,
                    direction: locationtarget.direction,
                    distance: aoedata['range']*5,
                    borderColor: game.user.color,
                      fillColor:"#000000"
                  }]);
                }
                }
            console.log(i.dataset.uuid)
              })
            })
            })
// Display PRPG Logo
Hooks.once("ready", () => {
  document.querySelector("#ui-left #logo").src = "https://cdn.discordapp.com/attachments/723454625671282704/1137998798824681572/fvttprpg.png"
})