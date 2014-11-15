// Generated by CoffeeScript 1.8.0
(function() {
  "use strict";
  var deepcopy, root;

  window.notifyEvalSourcePosition = function(startLine, startCol, endLine, endCol) {

    /*
        Shows the user the currently executing line.
        --> Where is this function called?
     */
    console.log(startLine, startCol, endLine, endCol);
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : this.codeland = {};

  root.UIcont = null;

  root.initialize = function(UIcont) {

    /*
        External Function (used by something outside of this file)
    
        Reads the config files, initializes Doppio, should be the first codeland function called.
    
        @param UICont
            A JQuery div where everything created by codeland will live.
     */
    $('#copyrightinfo').click(function() {
      return window.AboutPage();
    });
    root.gameSelectionScrollPosition = 0;
    root.loadJSONConfigs();
    root.UIcont = UIcont;
    root.initializeDoppio();
  };

  root.initializeDoppio = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Constructs the doppioAPI and tells it to preload the required code.
     */
    var count, last_display, preload_cb, progress, progress_cb;
    root.doppioReady = false;
    root.doppioPreloaded = false;
    progress = $('#progress');
    count = 0;
    last_display = "";
    progress_cb = function(ignore_incorrect_fraction) {

      /*
          Handles the progress bar and displaying what part of Doppio is loading
          to the user.
       */
      var display;
      count = count + 1;
      display = Math.floor((100 * count) / 391);
      if (display === 100) {
        display = "Starting Java Virtual Machine...";
      } else {
        display = "Opening " + display;
      }
      if (last_display !== display) {
        last_display = display;
        progress.html(display);
      }
    };
    preload_cb = function() {

      /*
          Once doppio has intialized, this function is called to tell
          doppio to pre-compile the functions used by the games.
       */
      root.doppioAPI.preload(root.beanshellPreload, root.wrapperCompiled_cb);
      root.doppioPreloaded = true;
    };
    root.doppioAPI = new DoppioApi(null, preload_cb, progress_cb);
  };

  root.wrapperCompiled_cb = (function(_this) {
    return function() {

      /*
          Internal Function (used only by the code in this file)
      
          Once doppio has finished pre-compiling, this draws the game-map
          and, should something be waiting on doppio to compile and has
          presented codeland with a callback, runs that callback.
      
          Note: In the current implementation, only the latest thing to
          assign a callback to codeland is run.
       */
      var player;
      root.doppioReady = true;
      console.log('Finished Preloading Doppio');
      player = root.getPlayer();
      root.drawGameMap(player);
      window.appendBar("#mainbody");
      if (root.wrapperCompiledCallback != null) {
        console.log('Found Callback, running');
        root.wrapperCompiledCallback();
      }
    };
  })(this);

  root.waitForWrapper = function(callback) {

    /*
        External Function (used by something outside of this file)
    
        Should there be something waiting for doppio to compile, it calls
        this functions and provides a callback which will then be run when
        doppio has finished compiling.
    
        Note: In the current implementation, only the latest thing to
        assign a callback to codeland is run.
    
        @param callback
            The function to call when doppio is finished compiling.
     */
    root.wrapperCompiledCallback = callback;
  };

  root.reference = function() {

    /*
        ???
        Could the author (or whomever knows) provide here information as to
        what this function does?
     */
  };

  root.drawGameMap = function(player) {

    /*
        Internal Function (used only by the code in this file)
    
        Draws the game selection screen.
    
        @param player
            The player whose games to display.
     */
    var addGameToMap, count, descriptions, gameKey, gameSequence, mapDiv, qcount, quest, sel, tmp1, _i, _j, _len, _len1, _ref, _ref1;
    descriptions = root.getGameDescriptions();
    mapDiv = $(root.UIcont);
    mapDiv.empty();
    gameSequence = root.getGameSequence();
    sel = new gameSelector(mapDiv, false);
    tmp1 = document.getElementById("gameSelection");
    count = 0;
    addGameToMap = function(game) {
      count = count + 1;
      sel.buildDiv(count, game, descriptions[game], player.games[game], root.canPlay(game), codeland);
    };
    qcount = 0;
    _ref = root.quests;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      quest = _ref[_i];
      $("<div bgcolor='#888888'>Quest " + (++qcount) + ":" + quest.title + "</div>").appendTo(tmp1);
      _ref1 = quest.games;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        gameKey = _ref1[_j];
        addGameToMap(gameKey);
      }
    }
    $('<span style="font-size:200%" class="cursiveHeadline">Choose your Java Game</span><br>').prependTo(tmp1);
    $('<img src="/img/cc0/treasuremap-128px.png">').prependTo(tmp1);
    $('#gameSelection').animate({
      scrollTop: root.gameSelectionScrollPosition
    }, 0);
  };

  root.startGame = function(game) {

    /*
        External Function (used by something outside of this file)
    
        Starts the given game, setting up the environment and creating the
        gameManager.
    
        @param game
            The game to start.
     */
    var description, env, found, gamediv, index, quest, stats, tmp1, _i, _len, _ref;
    console.log("Starting " + game);
    _ref = root.quests;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      quest = _ref[index];
      found = quest.games.indexOf(game);
      if (found !== -1) {
        root.currentQuest = root.quests[index];
        break;
      }
    }
    if (root.currentGame) {
      root.currentGame.finishGame();
    }
    root.currentGame = null;
    gamediv = $(root.UIcont);
    tmp1 = document.getElementById("gameSelection");
    if (tmp1 !== null) {
      root.gameSelectionScrollPosition = tmp1.scrollTop;
      root.UIcont.removeChild(tmp1);
    }
    description = root.getGameDescriptions()[game];
    stats = root.loadGameStats(game);
    stats.openedCount++;
    root.storeGameStats(game, stats);
    env = {
      key: game,
      description: description,
      visualMaster: root.visualMasters[game],
      frameRate: root.visualMasters[game].frameRate,
      gamediv: gamediv,
      player: root.getPlayer(),
      codeland: this,
      backEnd: description.backEnd,
      gameState: description.gameState,
      stats: stats
    };
    root.currentGame = new GameManager(env);
    root.currentGame.startGame();
    if (!(env.stats.runCount > 0)) {
      root.currentGame.helpTips();
    }
  };

  if (typeof deepcopy === "undefined" || deepcopy === null) {
    deepcopy = function(src) {
      return $.extend(true, {}, src);
    };
  }

  root.getString = function(key) {

    /*
        Internal Function (used only by the code in this file)
    
        Retrieves a string from the browser's internal storage dictionary.
    
        @param key
            The key for the string we are retrieving.
     */
    return localStorage.getItem(key);
  };

  root.setString = function(key, value) {

    /*
        Internal Function (used only by the code in this file)
    
        Sets a string in the browser's internal storage dictionary.
    
        @param key
            The key for the string we are storing.
            This should be a DOMString.
        @param value
            The value we want associated with the key in the browser's
            internal storage.
            This should be a DOMString.
     */
    return localStorage.setItem(key, value);
  };

  root.clearString = function(key) {

    /*
        Internal Function (used only by the code in this file)
    
        Clears a string in the browser's internal storage dictionary.
    
        @param key
            The key for the string we are clearing.
            This should be a DOMString.
     */
    localStorage.removeItem(key);
  };

  root.load = function(key) {

    /*
        Internal Function (used only by the code in this file)
    
        Retreives and parses data from the localstorage and returns it.
    
        @param key
            The key of the data to load.
     */
    var result, val;
    val = root.getString(key);
    if (val == null) {
      return null;
    }
    result = JSON.parse(val);
    if (result != null) {
      return result;
    }
    throw new Error("Could not parse " + val);
  };

  root.store = function(key, val) {

    /*
        Internal Function (used only by the code in this file)
    
        JSON-ifies the given value and stores it in the localstorage
        associated to the given key.
    
        @param key
            The key which which to associate the stored data.
        @param val
            The data to store.
     */
    if (val == null) {
      throw new Error("Value must exist");
    }
    root.setString(key, JSON.stringify(val));
  };

  root.loadGameStats = function(gameKey) {

    /*
        Internal Function (used only by the code in this file)
    
        Returns the game statistics for the game associated with gameKey.
        Returns default values for all statistics shouled the game not
        exist.
    
        @param gameKey
            The gameKey with which the game we want the statistics for
            is associated.
     */
    var data, p, _base;
    p = root.getPlayer();
    data = (_base = p.games)[gameKey] != null ? _base[gameKey] : _base[gameKey] = {};
    if (data.abortCount == null) {
      data.abortCount = 0;
    }
    if (data.runCount == null) {
      data.runCount = 0;
    }
    if (data.winCount == null) {
      data.winCount = 0;
    }
    if (data.lostCount == null) {
      data.lostCount = 0;
    }
    if (data.resetCount == null) {
      data.resetCount = 0;
    }
    if (data.openedCount == null) {
      data.openedCount = 0;
    }
    if (data.hiscore == null) {
      data.hiscore = 0;
    }
    if (data.passed == null) {
      data.passed = false;
    }
    if (data.stars == null) {
      data.stars = 0;
    }
    if (data.tipsCount == null) {
      data.tipsCount = 0;
    }
    return data;
  };

  root.storeGameStats = function(key, data) {

    /*
        External Function (used by something outside of this file)
    
        Adds the given statistics to the game corresponding to the given
        key and saves these to the current player.
    
        @param key
            The key of the game whose statistics we are storing.
        @param data
            The statistics to be added to the game's data.
     */
    if (!((key != null) && (data != null))) {
      throw new Error("Cannot be null");
    }
    root.updatePlayer(function(p) {
      var _base;
      if ((_base = p.games)[key] == null) {
        _base[key] = {};
      }
      return $.extend(p.games[key], data);
    });
  };

  root.showMap = function() {

    /*
        External Function (used by something outside of this file)
    
        Stops the current game and draws the game selection screen.
     */
    if (root.currentGame) {
      root.currentGame.finishGame();
    }
    if (root.wrapperCompiledCallback != null) {
      root.wrapperCompiledCallback = null;
    }
    root.currentGame = null;
    root.drawGameMap(root.getPlayer());
  };

  root.getGame = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Gets the game currently being played.
     */
    return getPlayer().currentGame;
  };

  root.getPlayer = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Retrieves and returns the current player.
        Returns a generic player should the current player not exist.
     */
    if (root.currentPlayer == null) {
      root.currentPlayer = root.load("CurrentPlayer");
    }
    if (root.currentPlayer == null) {
      root.currentPlayer = {
        id: +(new Date()),
        currentGame: '',
        first: '',
        last: '',
        avator: 'generic',
        games: {}
      };
    }
    return root.currentPlayer;
  };

  root.updatePlayer = function(callback) {

    /*
        Internal Function (used only by the code in this file)
    
        Updates the current player.
    
        @param callback
            A function which is passed the current player and expected
            to change the player.
            Its return value is ignored.
    
            See codeland.storeGameStats for an example.
     */
    var player;
    player = root.getPlayer();
    callback(player);
    root.store("CurrentPlayer", player);
  };

  root.clearPlayer = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Clears all data bout the current player.
     */
    root.clearString("CurrentPlayer");
  };

  root.readJSON = function(theurl, cb) {

    /*
        Internal Function (used only by the code in this file)
    
        Reads the json data at the given url via an ajax request.
        Passes the resulting data to the provided callback, passing
        undefined should the ajax request have failed.
    
        @param theurl
            The location and name of the json file.
        @param cb
            The callback function which will be passed the data from
            the json file.
     */
    var exception, fail;
    fail = false;
    console.log("Reading " + theurl);
    try {
      jQuery.ajax({
        dataType: 'json',
        url: theurl,
        async: false,
        error: function() {
          fail = true;
          console.log("Could not read " + theurl);
          cb(void 0);
        },
        success: function(data) {
          cb(data);
        }
      });
    } catch (_error) {
      exception = _error;
      fail = true;
      console.log("" + theurl + ": " + exception + " " + exception.message + " " + exception.stack);
    }
    if (fail) {
      throw "Configuration Exception reading " + theurl;
    }
  };

  root.loadJSONConfigs = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Reads and parses all of the config files.
     */
    var configFail;
    if (root.gameDescriptions == null) {
      root.gameDescriptions = {};
    }
    configFail = false;
    root.readJSON('config/config.json', function(data) {
      var quest, questIndex, type, _i, _j, _len, _len1, _ref, _ref1;
      if (data === void 0) {
        configFail = true;
      }
      root.baseDefaults = data.defaults;
      root.gameDefaults = {};
      _ref = data.gameTypes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        root.readJSON("config/" + type, function(typeData) {
          if (typeData === void 0) {
            configFail = true;
          }
          root.gameDefaults[typeData.gameType] = typeData;
        });
      }
      root.quests = [];
      root.visualMasters = {};
      root.beanshellPreload = data.beanshellPreload;
      questIndex = -1;
      _ref1 = data.quests;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quest = _ref1[_j];
        root.readJSON("config/" + quest, function(questData) {
          var game, _k, _len2, _ref2;
          if (questData === void 0 || questData.key === void 0) {
            configFail = true;
          }
          ++questIndex;
          root.quests[questIndex] = questData;
          _ref2 = questData.games;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            game = _ref2[_k];
            root.readJSON("config/" + game + ".json", function(gameData) {
              var error;
              if (gameData === void 0) {
                configFail = true;
              }
              try {
                root.addToObject(root.baseDefaults, gameData);
                root.addToObject(root.gameDefaults[gameData.gameType].defaults, gameData);
                root.visualMasters[game] = root.gameDefaults[gameData.gameType].visualMaster;
                root.stringifyConfigArrays(gameData);
                root.convertShorthandToCode(gameData);
                root.addHintsToCode(gameData);
                root.gameDescriptions[game] = gameData;
                return;
              } catch (_error) {
                error = _error;
                configFail = true;
                console.log("" + error + " " + error.message + " " + error.stack);
              }
            });
          }
        });
      }
      root.currentQuest = root.quests[0];
    });
    if (configFail) {
      root.gameDescriptions = null;
      throw "Configuration Exception";
    }
  };

  root.addToObject = function(source, destination) {

    /*
        Internal Function (used only by the code in this file)
    
        Recursively adds all attributes of source into
        destination.
        Does not overwrite attributes of destination.
    
        @param source
            The source dictionary where attributes are copied from.
        @param destination
            The destination dictionary where attributes are added to.
     */
    var key, value;
    for (key in source) {
      value = source[key];
      if (key in destination) {
        if (typeof value === "object") {
          root.addToObject(value, destination[key]);
        }
      } else {
        destination[key] = value;
      }
    }
  };

  root.stringifyConfigArrays = function(gameData) {

    /*
        Internal Function (used only by the code in this file)
    
        Converts gameData config information from arrays into newline
        deliminated strings.
    
        @param gameData
            The game's data.
     */
    var _ref, _ref1;
    if ((gameData != null ? (_ref = gameData.game.map) != null ? _ref.join : void 0 : void 0) != null) {
      gameData.game.map = gameData.game.map.join('\n');
    }
    if ((gameData != null ? gameData.code.prefix.join : void 0) != null) {
      gameData.code.prefix = gameData.code.prefix.join('\n');
    }
    if (gameData.code.prefix.charAt(gameData.code.prefix.length - 1) !== '\n') {
      gameData.code.prefix += '\n';
    }
    if ((gameData != null ? gameData.code.postfix.join : void 0) != null) {
      gameData.code.postfix = gameData.code.postfix.join('\n');
    }
    if ((gameData != null ? (_ref1 = gameData.code.initial) != null ? _ref1.join : void 0 : void 0) != null) {
      gameData.code.initial = gameData.code.initial.join('\n');
    }
  };

  root.convertShorthandToCode = function(gameData) {

    /*
        Internal Function (used only by the code in this file)
    
        Converts the shorthand code found in the game's json config
        to actual java code.
    
        @param gameData
            The game's data.
     */
    var initial, last, re, result, short, shorthand, _i, _len, _ref;
    if (gameData.code.initial != null) {
      return;
    }
    initial = '';
    shorthand = gameData.code.shorthand;
    if (shorthand == null) {
      return;
    }
    while (shorthand !== '') {
      _ref = gameData.code.shorthandKey;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        short = _ref[_i];
        re = new RegExp(short.regex);
        result = re.exec(shorthand);
        if (result !== null) {
          if (initial !== '') {
            last = initial.substring(initial.length - 1);
            if (last === ';') {
              initial += '\n';
            } else if (last !== '\n') {
              initial += '();\n';
            }
          }
          initial += short.repl;
          break;
        }
      }
      if (result === null) {
        result = /\(.*?\)/.exec(shorthand);
        if (result !== null) {
          initial += result[0] + ';';
        }
      }
      if (result !== null) {
        shorthand = shorthand.substring(result[0].length);
      } else {
        shorthand = shorthand.substring(1);
      }
    }
    if (initial !== '' && initial.substring(initial.length - 1) !== ';') {
      initial += '();';
    }
    gameData.code.initial = initial;
  };

  root.addHintsToCode = function(gameData) {

    /*
        Internal Function (used only by the code in this file)
    
        Takes the hints found in the comments array in the json config of
        the game and places them as java-style comments in the game's code.
    
        @param gameData
            The game's data.
     */
    var one, _base;
    if ((_base = gameData.code).initial == null) {
      _base.initial = '';
    }
    if (gameData.code.comments) {
      one = '// ' + ((gameData.code.comments.join('\n')).replace(/\n/g, '\n// ')) + '\n';
      if (gameData.code.prefix.length > 1) {
        gameData.code.prefix = one + gameData.code.prefix;
      } else {
        gameData.code.initial = one + '\n' + gameData.code.initial;
      }
    }
  };

  root.getGameDescriptions = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Returns the game descriptions, loading from the json config
        files if the descriptions do not already exist.
     */
    if (root.gameDescriptions != null) {
      return root.gameDescriptions;
    }
    root.loadJSONConfigs();
    return root.gameDescriptions;
  };

  root.getGameSequence = function() {

    /*
        Internal Function (used only by the code in this file)
    
        Returns the sequence of all of the games, creating it should
        it not already exist.
     */
    var addGame, g, games, ignored;
    if (root.gameSequence) {
      return root.gameSequence;
    }
    root.gameSequence = [];
    games = root.getGameDescriptions();
    addGame = (function(_this) {
      return function(name) {
        var doFirst, g, _base, _i, _len;
        if ($.inArray(name, root.gameSequence) !== -1) {
          return;
        }
        doFirst = (_base = games[name]).depends != null ? _base.depends : _base.depends = [];
        for (_i = 0, _len = doFirst.length; _i < _len; _i++) {
          g = doFirst[_i];
          addGame(g);
        }
        root.gameSequence.push(name);
      };
    })(this);
    for (g in games) {
      ignored = games[g];
      addGame(g);
    }
    return root.gameSequence;
  };

  root.canPlay = function(game) {

    /*
        Internal Function (used only by the code in this file)
    
        Returns whether or not the current player can play the
        given game.
    
        @param game
            The game we are checking.
     */
    var depends, g, passCount, player, _i, _len, _ref, _ref1, _ref2;
    player = root.getPlayer();
    if (player != null ? (_ref = player.games[game]) != null ? _ref.passed : void 0 : void 0) {
      return true;
    }
    depends = (_ref1 = root.getGameDescriptions()[game]) != null ? _ref1.depends : void 0;
    if (!depends) {
      return true;
    }
    passCount = 0;
    for (_i = 0, _len = depends.length; _i < _len; _i++) {
      g = depends[_i];
      if (player != null ? (_ref2 = player.games[g]) != null ? _ref2.passed : void 0 : void 0) {
        passCount++;
      }
    }
    return passCount === depends.length;
  };

}).call(this);