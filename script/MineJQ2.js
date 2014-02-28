/// <reference path="JQuery-1.6.2-vsdoc.js" />

(function ($) {
    $.fn.minesweeper = function (rows, columns, mines) {
        return this.each(function () {

            var that = this;

            var basicMarkup = $("<div class=\"game\"><div id=\"timerbase\"></div><div id=\"minebase\"></div></div>");

            $(this).append(basicMarkup);
            var mine = {};

            mine.GG = false;
            mine.noOfGames = 0;
            mine.noOfGamesWon = 0;

            mine.positionOfMines = [];

            mine.move = function (currentTime, currentClickEvent, currentBlock) {
                this.time = (+currentTime.substring(0, 2) * 60) + (+currentTime.substring(3, 5));
                this.click = currentClickEvent;
                this.block = currentBlock;
            };

            mine.game = function (id, rows, columns, positionOfMines) {
                this.gameId = id;
                this.col = columns;
                this.row = rows;
                this.mines = positionOfMines;
                this.moves = [];
                this.rerun = false;
            };

            mine.savedData = [];

            mine.replayGame = function (savedDataId) {
                var replayingGame = mine.savedData[savedDataId],
        i;
                $(".game").block();
                $(".replayGames").attr("disabled", true);
                $(".disable").attr("disabled", true);

                mine.rows = replayingGame.row;
                mine.cols = replayingGame.col;
                // recreate the same minefield and place mines...
                mine.createMineField();
                for (i = 0; i < replayingGame.mines.length; i = i + 1) {
                    $("#" + replayingGame.mines[i]).attr("class", "mine")
                                    .click(function (e) { mine.gameOver(e.target.id); });
                }
                mine.findBlockWeights();
                mine.timerStart();
                //console.log('length: ' + replayingGame.moves.length);
                for (i = 0; i < replayingGame.moves.length; i = i + 1) {
                    (function (newi) {
                        setTimeout(function () {
                            $("#" + replayingGame.moves[newi].block).trigger(replayingGame.moves[newi].click);
                            //console.log('newi: ' + newi);
                        }, replayingGame.moves[newi].time * 1000);
                    } (i));
                }
                setTimeout(function () {
                    $(".game").unblock();
                    $(".disable").attr("disabled", true);
                    $(".replayGames").attr("disabled", false);
                }, replayingGame.moves[replayingGame.moves.length - 1].time * 1000);
            };

            mine.saveMove = function (e) {
                mine.currentGame.moves.push(new mine.move($("#timer", $(that)).val(), e.type, e.target.id));
            };

            // set methods for variables
            mine.setGG = function () {
                mine.GG = true;
                if (!mine.currentGame.rerun) {
                    mine.currentGame.rerun = true;
                    mine.savedData.push(mine.currentGame);
                }
                if ($(".block", $(that)).length === 0) {
                    var time = $("#timer", $(that)).val().split(":");
                    mine.setBestTime(time[0], time[1]);
                    mine.setnoOfGamesWon();
                    jAlert("You Win...!!", "VICTORY...", function () {
                        $(".disable", $(that)).attr("disabled", false);
                        $("#mineField", $(that)).remove();
                        $("#timer", $(that)).remove();
                    });
                }
                else {
                    jAlert("Better Luck Next Time.. :'(", "GAME OVER", function () {
                        $(".disable", $(that)).attr("disabled", false);
                        $("#mineField", $(that)).remove();
                        $("#timer", $(that)).remove();
                    });
                }
            };

            mine.setnoOfGames = function () {
                if (!mine.currentGame.rerun) {
                    $("#txtTotalGames", $(that)).val(mine.noOfGames = mine.noOfGames + 1);
                }
            };

            mine.setnoOfGamesWon = function () {
                if (!mine.currentGame.rerun) {
                    $("#txtWon", $(that)).val(mine.noOfGamesWon = mine.noOfGamesWon + 1);
                }
            };


            // Best Time
            mine.BestTimeMin = 59;
            mine.BestTimeSec = 59;
            mine.setBestTime = function (min, sec) {
                if ((min < mine.BestTimeMin) || (min === mine.BestTimeMin && sec < mine.BestTimeSec)) {
                    mine.BestTimeMin = min;
                    mine.BestTimeSec = sec;

                    $("#txtBestTime", $(that)).val(mine.BestTimeMin + ":" + mine.BestTimeSec);
                    jAlert("Congratulations..!! You have beaten the best time", "BEST TIME");
                }
            };

            // Timer function
            mine.updateTime = function () {
                if (!mine.GG) {
                    mine.currentTime = mine.timerElapsed();
                    var time = Math.floor(mine.currentTime / 1000);
                    $("#timer", $(that)).val(((Math.floor(time / 60) < 10) ? ("0" + Math.floor(time / 60)) : Math.floor(time / 60)) + ":" + (((time % 60) < 10) ? ("0" + (time % 60)) : (time % 60)));
                }
                window.setTimeout(function () { mine.updateTime(); }, 1000);
            };


            mine.timerStart = function () {
                mine.startTime = new Date().getTime();
                window.setTimeout(function () { mine.updateTime(); }, 1000);
            };

            mine.timerElapsed = function () {
                return (new Date().getTime() - mine.startTime);
            };


            // Where the fun begins....
            mine.createMineField = function () {
                if ($("#customGameError", $(that)).length !== 0) {
                    $("#customGameError", $(that)).remove();
                }

                mine.positionOfMines = [];

                $(".disable", $(that)).attr("disabled", true);

                mine.GG = false;

                var columns = mine.cols,
        rows = mine.rows,
        i,
        j,
        html = $("<input type='text' id='timer' val()='00:00' class='timer readonly' disabled='true' />"),
        html0,
        html1,
        html2;

                // insert timer
                $("#timerbase", $(that)).append(html);

                //creating base
                html = $("<table id='mineField' cellspacing='0px' cellpadding='0px'></table>");
                $("#minebase", $(that)).append(html);

                for (i = 0; i < rows; i = i + 1) {
                    html0 = $("<tr id='tableRow" + i + "' class='tableRow'></tr>");
                    $("#mineField", $(that)).append(html0);
                    for (j = 0; j < columns; j = j + 1) {
                        html1 = $("<td id='tableData" + i + "-" + j + "'></td>");
                        $("#tableRow" + i, $(that)).append(html1);
                        html2 = $("<input type='button' id='block" + i + "-" + j + "' class='block' val()=' ' />");
                        //DynamicElement3.setAttribute("oncontextMenu", "mine.flag(id); return false;");
                        $("#tableData" + i + "-" + j, $(that)).append(html2);
                        $("#block" + i + "-" + j, $(that)).click(function (e) { mine.flip(e.target.id); mine.saveMove(e); mine.isGameOver(); })
                                    .bind("contextmenu", function (e) { mine.flag(e.target.id); mine.saveMove(e); return false; });
                    }
                }
            };


            mine.placeMines = function () {
                var i;
                for (i = 0; i < mine.mines; i = i + 1) {
                    mine.x = Math.floor(Math.random() * mine.rows);
                    mine.y = Math.floor(Math.random() * mine.cols);
                    if ($("#block" + mine.x + "-" + mine.y, $(that)).attr("class").indexOf("mine") === -1) {
                        $("#block" + mine.x + "-" + mine.y, $(that)).attr("class", "mine")
                                            .click(function (e) { mine.gameOver(e.target.id); });
                        mine.positionOfMines.push("block" + mine.x + "-" + mine.y);
                    }
                    else {
                        i = i - 1;
                    }
                }
            };

            mine.findBlockWeights = function () {
                var i,
        j,
        x,
        y,
        count;

                for (i = 0; i < mine.rows; i = i + 1) {
                    for (j = 0; j < mine.cols; j = j + 1) {
                        if ($("#block" + i + "-" + j, $(that)).attr("class").indexOf("mine") === -1) {
                            count = 0;
                            for (x = i - 1; x <= i + (+1); x = x + 1) {
                                for (y = j - 1; y <= j + (+1); y = y + 1) {
                                    if (((x >= 0 && x < mine.rows) && (y >= 0 && y < mine.cols)) && ($("#block" + x + "-" + y).attr("class").indexOf("mine") !== -1)) {
                                        count = count + 1;
                                    }
                                }
                            }
                            if (count !== 0) {
                                $("#block" + i + "-" + j, $(that)).attr("name", count);
                            }
                            else {
                                $("#block" + i + "-" + j, $(that)).addClass("zero");
                                $("#block" + i + "-" + j, $(that)).attr("name", count);
                            }
                        }
                    }
                }
            };

            mine.flip = function (blockId) {
                var block = $("#" + blockId, $(that)),
        id = blockId.substring(5).split("-"),
        i = id[0],
        j = id[1],
        x,
        y;

                if ((mine.GG === false) && (block.attr("class").indexOf("flag") === -1) && (block.attr("class").indexOf("doubt") === -1) && (block.attr("class").indexOf("mine") === -1)) {
                    if (block.attr("class").indexOf("flip") === -1) {
                        block.attr("class", "flip");
                        block.addClass("class" + block.attr("name"));
                        block.attr("disabled", true);
                    }
                    else {
                        return;
                    }

                    if (block.attr("name") === "0") {
                        for (x = i - 1; x <= (+i) + 1; x = x + 1) {
                            for (y = j - 1; y <= (+j) + 1; y = y + 1) {
                                if ((x >= 0 && x < mine.rows) && (y >= 0 && y < mine.cols)) {
                                    mine.flip("block" + x + "-" + y);
                                }
                            }
                        }
                    }
                }
                //        if (block.attr("class").indexOf("mine") !== -1) {
                //            // currently do nothing.. next function will take care..
                //        }
            };

            mine.flag = function (blockId) {
                var block = $("#" + blockId, $(that));
                if ((block.attr("class").indexOf("flag") === -1) && (block.attr("class").indexOf("doubt") === -1)) {
                    block.addClass("flag");
                }
                else if (block.attr("class").indexOf("flag") !== -1) {
                    block.removeClass("flag").addClass("doubt");
                }
                else if (block.attr("class").indexOf("doubt") !== -1) {
                    block.removeClass("doubt");
                }
            };

            mine.gameOver = function (blockId) {
                var block = $("#" + blockId, $(that));
                if ((mine.GG === false) && (block.attr("class").indexOf("flag") === -1) && (block.attr("class").indexOf("doubt") === -1)) {
                    block.attr("class", "explodedMine");
                    $(".mine", $(that)).addClass("unexplodedMine");
                    mine.setGG();
                }
            };

            mine.isGameOver = function () {
                if (mine.GG === true || $(".block", $(that)).length === 0) {
                    mine.setGG();
                    return true;
                }
                else {
                    return false;
                }
            };

            //            mine.easyGame = function () {
            //                mine.createMineField();
            //                mine.placeMines();
            //                mine.findBlockWeights();
            //                mine.currentGame = new mine.game(0, mine.rows, mine.cols, mine.positionOfMines);
            //                mine.setnoOfGames();
            //                mine.timerStart();
            //            };

            //            mine.mediumGame = function () {
            //                mine.createMineField();
            //                mine.placeMines();
            //                mine.findBlockWeights();
            //                mine.currentGame = new mine.game(0, mine.rows, mine.cols, mine.positionOfMines);
            //                mine.setnoOfGames();
            //                mine.timerStart();
            //            };

            //            mine.hardGame = function () {
            //                mine.createMineField();
            //                mine.placeMines();
            //                mine.findBlockWeights();
            //                mine.currentGame = new mine.game(0, mine.rows, mine.cols, mine.positionOfMines);
            //                mine.setnoOfGames();
            //                mine.timerStart();
            //            };

            mine.customGame = function () {
                // initializing values
                mine.cols = columns || 10;
                mine.rows = rows || 5;
                mine.mines = mines || 10;


                if ((isNaN(mine.rows) || (mine.rows === "") || mine.rows === "0") || (isNaN(mine.cols) || (mine.cols === "") || mine.cols === "0") || (isNaN(mine.mines) || (mine.mines === "") || mine.mines === "0") || (mine.rows * mine.cols < (+mine.mines))) {
                    if ($("#customGameError", $(that)).length === 0) {
                        $(that).append($("<div id='customGameError'><label>Please enter no. of rows, columns and mines properly</label></div>"));
                        return;
                    }
                    return;
                }


                //                mine.rows = $("#txtRows").val();
                //                mine.cols = $("#txtCols").val();
                //                mine.mines = $("#txtMines").val();
                mine.createMineField();
                mine.placeMines();
                mine.findBlockWeights();
                mine.currentGame = new mine.game(0, mine.rows, mine.cols, mine.positionOfMines);
                mine.setnoOfGames();
                mine.timerStart();
            };


            // entry point... (not anymore)
            mine.startGame = function () {



                $("#btnReplay", $(that)).click(function () {
                    var i,
                html4;
                    $(".disable", $(that)).attr("disabled", true);
                    $("#replay", $(that)).append($("<div id='replayGames'></div>"));

                    for (i = 0; i < mine.savedData.length; i = i + 1) {
                        (function (newi) {
                            var html3 = $("<div style='clear: both'></div><div><input type='button' id='btnReplayGame" + newi + "' class='replayGames' value='Replay Game " + newi + "' /></div>");
                            $("#replayGames", $(that)).append(html3);
                            $("#btnReplayGame" + newi, $(that)).click(function () {
                                mine.replayGame(newi);
                            });
                        } (i));
                    }

                    html4 = $("<div style='clear: both'></div><div><input type='button' id='btnReplayExit' class='replayGames' value='Exit Replay' /></div>");
                    $("#replayGames", $(that)).append(html4);
                    $("#btnReplayExit", $(that)).click(function () {
                        $(".disable", $(that)).attr("disabled", false);
                        $("#replayGames", $(that)).remove();
                    });
                });
            };

            //$(document).ready(mine.startGame);
            $(document).ready(mine.customGame);
        });
    };
})(jQuery);


