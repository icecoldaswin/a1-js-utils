
var commandNav={hist: [], index: 0};

function navigateCommandHistory(event) {
    if(document.querySelector('#command').dataset.mode === 'multi' && document.getElementById('cmd').value !== '') {
        return;
    }
    
    var direction = event.keyCode == 38 ? -1 : 1;
    if (commandNav.index + direction >= 0 
            || commandNav.index + direction >= commandNav.hist.length) {
            commandNav.index = direction === -1 ? 0 : commandNav.hist.length -1 ;
    }
    
    document.getElementById('cmd').value = commandNav.hist[commandNav.index];
}

function readInput(callBack, prompt) {
    if (callBack === undefined) {
        throw new Error("You need to supply a call back to be invoked when user input is available.");
    }
    if(prompt !== undefined) {
        console.log(prompt);
    }
    
    callbackFnDef = eval("assignedCallback = " + callBack);
    
    rewireHandlerRunCmd(callbackFnDef, 1);
}

function tempHook(e, callback, n, forNsteps) {
    callback(e.target.value);
    postRun({addToHistory: false});
    handlers[13] = 
        (n >= forNsteps) 
            ? runCmd 
            : e => tempHook(e, callback, ((n === 0) ? 1 : n++));
}

function rewireHandlerRunCmd(callback, max) {
    let forNsteps = max === undefined ? 1 : max;
    handlers[13] = e => tempHook(e, callback, 1, forNsteps);
}

function postRun(props) {
    if (props.addToHistory) {
        commandNav.hist.push(document.getElementById('cmd').value);
    }
    document.getElementById('cmd').value = "";
    document.getElementById('console-fieldset').scrollTop = document.getElementById('console-fieldset').scrollHeight;
}

function runCmd(event) {
    console.log(
        "cmdlet-" // highlighting prefix.
        + "> "      // Indicate this is a user-input command.
        + document.getElementById('cmd').value
    );

    var result;
    try {
        result = eval(document.getElementById('cmd').value);
    } catch(err) {
        result = err;
    }

    console.log(result);
    
    postRun({addToHistory: true});
}

var handlers = { 
    13: runCmd, 
    38: navigateCommandHistory,
    40: navigateCommandHistory,
};

function handleKeyPress(event) {
    if((document.querySelector('#command').dataset.mode === 'multi' && event.which === 13 && event.shiftKey)) {
        return; // Ignore shift+enter in multi line mode.
    }

    if(handlers[event.which] !== undefined){
        handlers[event.which](event)
    };
}

var commandInputControls = {
    singleInputSymbol: ">",
    multiInputSymbol:  "<pre>{/}</pre>"
}

var clearconsole = () => document.getElementById('console-log').innerHTML = "";
var createConsole = () => {
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://icecoldaswin.github.io/a1-js-utils/on-page-console.css';
    link.media = 'all';
    head.appendChild(link);

    link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    link.media = 'all';
    head.appendChild(link);

    var fieldSet = document.createElement('fieldset');
    fieldSet.classList = "themed-color-code console";
    fieldSet.style.borderColor = "aliceblue";
    fieldSet.style.height =  "100%";
    fieldSet.style.overflowY = "auto";
    fieldSet.id = "console-fieldset";

    var legend = document.createElement("legend");
    
    var showHideCtaControls = {
        hide: {
            targetIcon: "fa-square-plus",
            controller: () => fieldSet.style.display = "none"
        },
        show: {
            targetIcon: "fa-square-minus",
            controller: () => fieldSet.style.display = "initial"
        }
    };

    var showHideCta = document.createElement("span");
    showHideCta.id = "show-hide-cta";
    showHideCta.dataset.targetState = "cta-show";
    showHideCta.addEventListener('click', e => {clearconsole()});
    var showHideCtaIcon = document.createElement("i");
    showHideCtaIcon.classList = "fa-regular " + showHideCtaControls[showHideCta.dataset.targetState];
    showHideCta.appendChild(showHideCtaIcon);
    showHideCta.addEventListener('click', e => {
        showHideCtaControls[e.target.dataset.targetState].controller();
        targetState = (e.target.dataset.targetState == 'show') ? 'hide' : 'show';
        delete e.target.dataset.targetState;
        e.target.dataset.targetState = targetState;
    });

    var clearConsoleCta = document.createElement("span");
    clearConsoleCta.id = "clear-console-cta";
    clearConsoleCta.addEventListener('click', e => {clearconsole()});
    var clearConsoleFaRefreshIcon = document.createElement("i");
    clearConsoleFaRefreshIcon.classList = "fa fa-refresh";
    clearConsoleCta.appendChild(clearConsoleFaRefreshIcon);

    legend.innerText = "Console ";
    legend.appendChild(clearConsoleCta);
    legend.appendChild(showHideCta);
    
        var consoleLogDiv = document.createElement('div');
        consoleLogDiv.id = "console-log";
        consoleLogDiv.style.overflowX = "auto"; 
        consoleLogDiv.style.overflowY = "auto"; 
        consoleLogDiv.style.fontFamily = "monospace"; 
        consoleLogDiv.style.fontSize = "small";


        var commandInput = document.createElement('span');
        commandInput.id = "command";
        commandInput.dataset.mode = "single";
        commandInput.style.display = "inline";
        commandInput.style.overflowX = "auto";
        commandInput.style.fontFamily = "monospace";
        commandInput.style.fontSize = "small";

        var commandInputRenderingTable = document.createElement('table');
            commandInputRenderingTable.id = "cmd-table";
            commandInputRenderingTable.style.width = "100%";
            var commandInputRenderingTableTr = document.createElement('tr');
                var commandSymbolRenderingTableTd = document.createElement('td');
                var commandSymbolBtn = document.createElement('button');
                    
                    commandSymbolBtn.style.width = "70%";
                    commandSymbolBtn.innerHTML = commandInput.dataset.mode === 'single' ? commandInputControls.singleInputSymbol : commandInputControls.multiInputSymbol;
                commandSymbolRenderingTableTd.appendChild(commandSymbolBtn);
                var commandInputRenderingTableTd = document.createElement('td');
                    commandInputRenderingTableTd.classList = "themed-color-code console";
                    commandInputRenderingTableTd.style.width = "95%";
                    
                
                var commandInputSingle = document.createElement('input');
                    commandInputSingle.type = "text";
                    commandInputSingle.style.width = "100%";
                    commandInputSingle.style.border = "none";
                    commandInputSingle.style.display = "inline";
                    commandInputSingle.id = "cmd";
                    commandInputSingle.placeholder="command";
                    commandInputSingle.autofocus = 'true';
                    commandInputSingle.classList = "themed-color-code console";
                    commandInputSingle.addEventListener('keydown', e => handleKeyPress(e));
                commandInputControls["singleInputControl"] = commandInputSingle;

                var commandInputMulti = document.createElement('textarea');
                    commandInputMulti.rows = 15;
                    commandInputMulti.style.width = "100%";
                    commandInputMulti.style.border = "none";
                    commandInputMulti.style.display = "inline";
                    commandInputMulti.id = "cmd";
                    commandInputMulti.placeholder="command; shift+enter for next line.";
                    commandInputMulti.autofocus = 'true';
                    commandInputMulti.classList = "themed-color-code console";
                    commandInputMulti.addEventListener('keydown', e => handleKeyPress(e));
                commandInputControls["multiInputControl"] = commandInputMulti;
                commandInputRenderingTableTd.appendChild(commandInput.dataset.mode === 'single' ? commandInputSingle : commandInputMulti);
                
                commandSymbolRenderingTableTd.addEventListener('click', () => {
                    commandSymbolBtn.innerHTML = commandInput.dataset.mode === 'single' ? commandInputControls.multiInputSymbol : commandInputControls.singleInputSymbol;
                    commandInputRenderingTableTd.removeChild(commandInput.dataset.mode === 'single' ? commandInputSingle : commandInputMulti);
                                        
                    var previousMode = commandInput.dataset.mode;
                    delete commandInput.dataset.mode;
                    commandInput.dataset.mode = (previousMode === 'single' ? 'multi' : 'single');

                    commandInputRenderingTableTd.appendChild(commandInput.dataset.mode === 'single' ? commandInputSingle : commandInputMulti);
                });

            commandInputRenderingTableTr.appendChild(commandSymbolRenderingTableTd);
            commandInputRenderingTableTr.appendChild(commandInputRenderingTableTd);
        commandInputRenderingTable.appendChild(commandInputRenderingTableTr);
        commandInput.appendChild(commandInputRenderingTable);

    fieldSet.appendChild(legend);
    fieldSet.appendChild(consoleLogDiv);
    fieldSet.appendChild(document.createElement("hr"));
    fieldSet.appendChild(commandInput);

    var consolePlaceHolderResults = document.querySelectorAll("[create-console-here]");
    
    if(consolePlaceHolderResults.length <= 0) {
        console.log('Place holder not found! Cannot create console.');
    } else if(consolePlaceHolderResults.length > 1) {
        console.log('Multiple place holders found! Console shall be created on the first one.');
    } else {
        var consolePlaceHolder = consolePlaceHolderResults[0];
        consolePlaceHolder.appendChild(fieldSet);
        
        wireup();
    }
};

var wireup = () => {
    var oldLog = console.log;
    var oldErr = console.error;
    var onBrowserLogConsole = document.getElementById("console-log");
    var theme = "night";
    var flip = (theme) => (theme === "day" ? "night" : "day");

    var toggleTheme = (force) => {
        var toggleThemeCta = document.querySelector('#toggle-theme-cta');
        
        previousTheme = (theme === undefined ? "day" : theme);
        theme = force !== undefined ? force : flip(previousTheme);
        
        if (toggleThemeCta !== null && toggleThemeCta.dataset['initial']) {
            delete toggleThemeCta.dataset.initial;
        }  
           
        document.querySelectorAll('.themed-color-code').forEach(element => {
            className = element.className;
            themeSetInFrom = className.indexOf("day") >= 0 ? "day" : className.indexOf("night")  >= 0 ? "night" : false;
            
            if (themeSetInFrom !== false && themeSetInFrom !== previousTheme) {
                console.log("Previous theme configuration error detected, will be overwritten");
            }

            toThemeClassName = 
                (themeSetInFrom !== undefined && themeSetInFrom !== false) 
                    ? className.replace(themeSetInFrom, theme)
                    : className+" "+theme;
            
            element.className = toThemeClassName;
        });

        if (toggleThemeCta !== null) {
            toggleThemeCta.innerHTML 
                = "<i class=\"fa fa-"+ {"day": "sun", "night": "moon"}[previousTheme] +"-o\"></i>";
        }
    };
    toggleTheme();
    
    var pipe = function (message) {
        try {
            var x = document.createElement("span");
        
            var dateSpan = document.createElement("span");
            dateSpan.style = "color: gray";
            dateSpan.innerText = "["+(new Date().toLocaleString('en-US', {hour12: false}))+"] ";
            
            if (message instanceof Error) {
                x.className = "themed-color-code console-message error " + theme;
                
                x.innerText = message.stack;
            } else if (typeof message === 'number' || typeof message === 'boolean' || typeof message === 'object') {
                x.className = "themed-color-code console-message system " + theme;

                x.innerText = message + ". Stringified: " + JSON.stringify(message);
            } else if(typeof message === 'function') {
                x.className = "themed-color-code console-message system " + theme;

                x.innerText = message;
            } else if(message !== undefined && message.startsWith("cmdlet-")) {
                x.className = "themed-color-code console-message reserved-words " + theme;

                x.innerText = message.substr(7);
            } 
            else {
                x.className = "themed-color-code console-message user " + theme;

                x.innerText = message;
            }

            onBrowserLogConsole.appendChild(dateSpan);
            onBrowserLogConsole.appendChild(x);
            onBrowserLogConsole.appendChild(document.createElement("br"));
        } catch(error) {
            oldLog("Unable to log the following on onBrowserLogConsole:");
            oldLog("===================================================");
            oldLog.apply(console, arguments);
            oldLog("===================================================");
            oldLog("");
            oldLog("Error:");
            oldLog("======");
            oldLog(error.stack);
        }
        document.getElementById('console-fieldset').scrollTop = document.getElementById('console-fieldset').scrollHeight;
    };
    console.log = pipe;
    console.error = pipe;
};

(function (exports, d) {
    function domReady(fn, context) {

      function onReady(event) {
        d.removeEventListener("DOMContentLoaded", onReady);
        fn.call(context || exports, event);
      }

      function onReadyIe(event) {
        if (d.readyState === "complete") {
          d.detachEvent("onreadystatechange", onReadyIe);
          fn.call(context || exports, event);
        }
      }

      d.addEventListener && d.addEventListener("DOMContentLoaded", onReady) ||
        d.attachEvent && d.attachEvent("onreadystatechange", onReadyIe);
    }

    exports.domReady = domReady;
})(window, document);

domReady(createConsole);
