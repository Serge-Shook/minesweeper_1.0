"use strict";

window.onload = () => {
    document.oncontextmenu = () => false;
    document.onmousedown = () => false;

    let difficultyLevel = localStorage.getItem('level') || 'beginner';

    const currentDifficulty = document.getElementById('current-difficulty');
    const minefield = document.getElementById('minefield');
    const minesLeftField = document.getElementById('mines-left');
    const resetTime = document.getElementById('reset-time');
    const minesweeper = document.getElementById('minesweeper');

    const initialX = localStorage.getItem('x');
    const initialY = localStorage.getItem('y');

    minesweeper.style.left = initialX + 'px';
    minesweeper.style.top = initialY + 'px';

    currentDifficulty.innerHTML = difficultyLevel;

    const presets = {
        beginner: [9, 9, 10],
        intermediate: [16, 16, 40],
        expert: [30, 16, 99],
        easy: [6, 12, 10],
        medium: [10, 20, 35],
        hard: [13, 26, 75]
    };

    const body = getComputedStyle(document.body);

    const moveByHandle = (itemId, handleId) => {
        const item = document.getElementById(itemId);
        const handle = document.getElementById(handleId);

        let rangeX, rangeY;

        const calculateRanges = () => {
            rangeX = document.body.clientWidth - item.offsetWidth;
            rangeY = document.documentElement.clientHeight - item.offsetHeight -
                (Number.parseInt(body.marginTop) + Number.parseInt(body.marginBottom));
        };

        const moveItemTo = (x, y) => {
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
        };

        const stayInRange = (value, from, to) => {
            if (value > to) {
                value = to;
            }

            if (value < from) {
                value = from;
            }
            return value;
        };

        const fixOutOfRange = () => {
            const currentY = Number.parseInt(item.style.top);
            const currentX = Number.parseInt(item.style.left);

            moveItemTo(stayInRange(currentX, 0, rangeX), stayInRange(currentY, 0, rangeY));
        };

        calculateRanges();

        const adjustResize = () => {
            calculateRanges();
            fixOutOfRange();
        };

        window.addEventListener('resize', adjustResize);

        const moveProcessor = event => {
            item.style.left = `${stayInRange(event.clientX - biasX, 0, rangeX)}px`;
            item.style.top = `${stayInRange(event.clientY - biasY, 0, rangeY)}px`;
        };

        let biasX, biasY;

        const startMoving = event => {
            document.addEventListener('mousemove', moveProcessor);
            biasX = event.clientX - (Number.parseInt(item.style.left) || 0);
            biasY = event.clientY - (Number.parseInt(item.style.top) || 0);
        };

        const stopMoving = () => {
            document.removeEventListener('mousemove', moveProcessor);
        };

        document.addEventListener('mouseup', stopMoving);

        handle.addEventListener('mousedown', startMoving);

        return adjustResize;
    };

    const adjustResize = moveByHandle('minesweeper', 'infobar');

    const drawMinefield = () => {
        let row = '<tr>';

        for (let i = 0; i < presets[difficultyLevel][0]; i++) {
            row += '<td></td>';
        }

        row += '</tr>';

        let tbody = '';

        for (let i = 0; i < presets[difficultyLevel][1]; i++) {
            tbody += row;
        }

        minefield.innerHTML = tbody;
        minesLeftField.innerHTML = presets[difficultyLevel][2];
        document.body.style.minWidth = `${minesweeper.offsetWidth}px`;
        adjustResize();
    };

    const difficultyMenu = document.createElement('ul');
    difficultyMenu.id = 'difficulty-menu';

    drawMinefield();

    const alertFinalMessage = (id, headerText, hideOk) => {
        const greyCover = document.createElement('div');
        greyCover.id = 'alertBackground';

        const finalMessage = document.createElement('div');
        finalMessage.id = id;
        finalMessage.className = 'final-message';
        if (headerText) {
            finalMessage.insertAdjacentHTML('afterbegin', `<h1>${headerText}</h1>`);
        }
        greyCover.append(finalMessage);

        const okButton = document.createElement('img');
        okButton.src = 'icons/check.svg';
        okButton.id = 'ok';
        if (hideOk) {
            okButton.style.display = 'none';
        }

        finalMessage.append(okButton);

        // okButton.addEventListener('click', () => greyCover.remove());
        okButton.addEventListener('click', () => fadeOut(greyCover));

        // document.body.append(greyCover);
        fadeIn(document.body, 'beforeend', greyCover);

        const obj = {
            addP(text, id) {
                const newP = document.createElement('p');
                newP.innerHTML = text;
                if (id) {
                    newP.id = id;
                }
                okButton.before(newP);
                return newP;
            },

            addElement(element) {
                okButton.before(element);
            },

            addHTML(html) {
                okButton.insertAdjacentHTML('beforebegin', html);
            },

            hideOk() {
                okButton.style.display = 'none';
            },

            showOk() {
                okButton.style.display = '';
            },

            removeLastElement() {
                okButton.previousElementSibling.remove();
            },

            remove() {
                fadeOut(greyCover);
                // greyCover.remove();
            }
        }

        return obj;
    };

    let endGame;

    const makeDifficultyMenu = () => {
        let selectOptions = '';
        for (let presetName in presets) {
            selectOptions += `<li><span>${presetName}</span><img src="icons/list.svg" title="Посмотреть таблицу рекордов"></li>`;
        }
        selectOptions += '<li id="king"><span>King Size!</span><img src="icons/settings.svg"></li>';

        difficultyMenu.innerHTML = selectOptions;

        difficultyMenu.onmousedown = event => {
            const showRecordsTable = async (tableName, num) => {
                const queryData = new FormData();
                queryData.set('name', tableName);
                queryData.set('num', num.toString());

                const response = await fetch('get_records.php', {
                    method: 'POST',
                    body: queryData
                });

                const recordsTable = alertFinalMessage('table-of-records', tableName);

                if (!response.ok) {
                    recordsTable.addP('Недоступна таблица рекордов');
                } else {
                    recordsTable.addHTML(await response.text());
                }
            };

            const kingMenu = document.createElement('div');
            kingMenu.id = 'king-menu';
            kingMenu.innerHTML = '<p>Плотность мин:</p>' +
                '<form id="density-form" name="densityForm">' +
                '<input type="radio" name="density" value="less" id="dens1"><label for="dens1">Меньше</label><br>' +
                '<input type="radio" name="density" value="norm" id="dens2"><label for="dens2">Обычная</label><br>' +
                '<input type="radio" name="density" value="more" id="dens3"><label for="dens3">Больше</label><br>' +
                '</form>' +
                '<div id="king-menu-buttons">' +
                '<img src="icons/check.svg" title="OK" id="king-menu-button-ok">' +
                '<img src="icons/list.svg" title="Рекорды проигравших" id="king-lost-button">' +
                '<img src="icons/star.svg" title="Рекорды победителей" id="king-win-button">' +
                '<img src="icons/help-circle.svg" title="F.A.Q." id="king-menu-button-faq">' +
                '<img src="icons/mail.svg" title="Оставить сообщение" id="leave-message">' +
                '</div>';

            const kingRadioOptions = kingMenu.querySelector('form');

            for (let input of kingRadioOptions) {
                input.checked = (input.value === kingDensitySet);
            }

            const kingMenuCover = document.createElement('div');
            kingMenuCover.id = 'king-cover';
            kingMenuCover.onclick = () => {
                kingMenu.remove();
                kingMenuCover.remove();
            };

            const showKingSettingsMenu = () => {
                document.body.append(kingMenuCover);
                kingMenu.style.top = difficultyMenu.clientHeight + 33 + 'px';
                resetTime.append(kingMenu);

                document.forms.densityForm.onchange = () => {
                    kingDensitySet = document.forms.densityForm.density.value;
                    calculateKingSize();

                    if (!gameStarted && !gameFinished && difficultyLevel === 'King Size!') {
                        drawMinefield();
                    }
                };

                document.getElementById('king-menu-button-ok').onclick = () => {
                    kingMenu.remove();
                    kingMenuCover.remove();
                };

                document.getElementById('king-menu-button-faq').onclick = () => {
                    const faqMessage = alertFinalMessage('faq-message', 'F.A.Q.');
                    const text = `<ul>
                    <li><b>Как играть.</b> Выберите уровень сложности, затем нажмите на любую ячейку, она окажется пустой,
                    одновременно откроются все ячейки вокруг неё и вокруг всех других пустых открытых ячеек. Дальше используйте логику.
                    Если вокруг ячейки с цифрой «1» есть одна неоткрытая ячейка, значит она занята миной, отметьте её, нажав правую кнопку.</li>
                    </ul>`;
                    faqMessage.addHTML(text);
                };

                document.getElementById('king-lost-button').onclick = () => {
                    const recordsTable = alertFinalMessage('best-king-lost', 'Проигравшие:');

                    const getKingLostGecords = async () => {
                        const response = await fetch('get_king_lost_records.php', {
                            method: 'POST'
                        });

                        if (!response.ok) {
                            recordsTable.addP('Недоступна таблица рекордов');
                        } else {
                            recordsTable.addHTML(await response.text());
                        }
                    };

                    getKingLostGecords();
                };

                document.getElementById('king-win-button').onclick = () => {
                    const recordsTable = alertFinalMessage('best-king-win', 'Победители:');

                    const getKingWinGecords = async () => {
                        const response = await fetch('get_king_win_records.php', {
                            method: 'POST'
                        });

                        if (!response.ok) {
                            recordsTable.addP('Недоступна таблица рекордов');
                        } else {
                            recordsTable.addHTML(await response.text());
                        }
                    };

                    getKingWinGecords();
                };

                document.getElementById('leave-message').onclick = () => {
                    const messageForm = alertFinalMessage('leave-message', 'Оставить сообщение', true);
                    const formHTML = `<form name="message">
                    <input type="text" name="name" placeholder="Ваше имя" value="${localStorage.getItem('name') || ''}">
                    <textarea name="text" cols="30" rows="10" placeholder="Сообщение"></textarea>
                    <input type="submit" value="Отправить">
                    <input type="button" id="cancel-form" value="Отмена">
                    </form>`;
                    messageForm.addHTML(formHTML);
                    const form = document.forms.message;
                    document.onmousedown = null;
                    document.getElementById('cancel-form').onclick = () => {
                        messageForm.remove();
                        document.onmousedown = () => false;
                    };

                    form.onsubmit = async (event) => {
                        event.preventDefault();
                        const data = new FormData(form);
                        localStorage.setItem('name', form.elements.name.value);

                        const resp = await fetch('message.php', {
                            method: 'POST',
                            body: data
                        });

                        if (resp.ok) {
                            const answer = await resp.text();
                            messageForm.addP(answer);
                        } else {
                            messageForm.addP('Служба сообщений недоступна');
                        }

                        messageForm.showOk();
                        form.remove();
                        document.onmousedown = () => false;
                    };
                };
            };

            if (event.target.tagName === 'IMG') {
                if (event.target.parentElement.id === 'king') {
                    showKingSettingsMenu();
                } else {
                    showRecordsTable(event.target.previousElementSibling.innerHTML, 20);
                }
            } else if (event.target.tagName === 'LI' || event.target.tagName === 'SPAN') {
                if (event.target.tagName === 'SPAN') {
                    difficultyLevel = event.target.innerHTML;
                } else {
                    difficultyLevel = event.target.firstElementChild.innerHTML;
                }
                currentDifficulty.innerHTML = difficultyLevel;
                if (difficultyLevel !== 'King Size!') {
                    localStorage.setItem('level', difficultyLevel);
                }

                invisibleCover.remove();
                difficultyMenu.remove();

                if (gameStarted) {
                    endGame();
                }

                timer.reset();
                drawMinefield();
                minefield.addEventListener('click', startNewGame);
            }
        };
    };

    makeDifficultyMenu();

    let kingDensitySet = localStorage.getItem('density') || 'norm';

    const calculateKingSizeOnce = () => {
        const densities = {
            less: 0.190,
            norm: 0.206,
            more: 0.222
        };

        const oneCell = document.querySelector('#minefield td');
        const body = getComputedStyle(document.body);

        const cellWidth = oneCell.offsetWidth;
        const marginX = minesweeper.offsetWidth - cellWidth * presets[difficultyLevel][0] +
            Number.parseInt(body.marginLeft) + Number.parseInt(body.marginRight);

        const cellHeight = oneCell.offsetHeight;
        const marginY = minesweeper.offsetHeight - cellHeight * presets[difficultyLevel][1] +
            Number.parseInt(body.marginTop) + Number.parseInt(body.marginBottom);

        const calculateKingSize = () => {
            const kingWidth = Math.floor((document.documentElement.clientWidth - marginX) / cellWidth);
            let kingHeight = Math.floor((document.documentElement.clientHeight - marginY) / cellHeight);
            kingHeight = kingHeight < 1 ? 1 : kingHeight;
            const kingNumberOfMines = Math.round(kingWidth * kingHeight * densities[kingDensitySet]);
            presets['King Size!'] = [kingWidth, kingHeight, kingNumberOfMines];
        };

        calculateKingSize();

        return calculateKingSize;
    };

    const calculateKingSize = calculateKingSizeOnce();

    window.onresize = () => {
        calculateKingSize();
        if (!gameStarted && !gameFinished && difficultyLevel === 'King Size!') {
            drawMinefield();
        }
    };

    let gameStarted = false;
    let gameFinished = false;

    const timer = {
        baseTime: 0,
        started: false,
        show() {
            let time;
            let dots;

            if (this.started) {
                time = this.baseTime + Date.now() - this._startedAt;
                dots = ((time % 1000) < 500) ? ':' : '<span class="hidden">:</span>';
            } else {
                time = this.baseTime;
                dots = ':';
            }
            const seconds = Math.floor(time / 1000);
            const s = (seconds % 60).toString();
            const ss = (s.length === 1) ? '0' + s : s;
            const mins = Math.floor(seconds / 60);
            const displayTime = mins + dots + ss;
            document.getElementById('timer').innerHTML = displayTime;
            return displayTime;
        },

        start() {
            if (!this.started) {
                this._startedAt = Date.now();
                this.started = true;
                this.live = setInterval(() => this.show(), 100);
            }
        },

        stop() {
            if (this.started) {
                this.baseTime += (Date.now() - this._startedAt);
                this.started = false;
                clearInterval(this.live);
                this.show();
            }
        },

        reset() {
            this.baseTime = 0;
            this.started = false;
            if (this.live) {
                clearInterval(this.live);
            }
            this.show();
        }
    };

    const invisibleCover = document.createElement('div');
    invisibleCover.id = 'thin-cover';
    invisibleCover.onclick = () => {
        difficultyMenu.remove();
        invisibleCover.remove();
        if (gameStarted) {
            timer.start();
        }
    };

    document.getElementById('difficulty').onclick = () => {
        timer.stop();
        const lis = difficultyMenu.querySelectorAll('li');
        for (let li of lis) {
            if (li.querySelector('span').innerHTML === difficultyLevel) {
                li.className = 'selected';
            } else {
                li.className = '';
            }
        }
        document.body.append(invisibleCover);
        resetTime.append(difficultyMenu);
    };

    const startNewGame = event => {
        if (event.which === 1 && event.target.tagName === 'TD') {
            minefield.removeEventListener('click', startNewGame);
            startGame(event);
        }
    };

    const startGame = event => {
        const armed = Symbol('armed');
        const opened = Symbol('opened');
        const marked = Symbol('marked');

        const [minefieldWidth, minefieldHeight, numberOfMines] = presets[difficultyLevel];
        let minesLeft = numberOfMines;
        let cellsUnopened = minefieldHeight * minefieldWidth - numberOfMines;

        const zeroAroundCells = [];

        const displayMinesLeft = () => minesLeftField.innerHTML = String(minesLeft);

        let leftPressed = false;
        let rightPressed = false;

        const toggleCellMarked = cell => {
            if (!cell[marked] && cell.innerHTML === '') {
                cell[marked] = true;
                minesLeft--;
                cell.innerHTML = '🚩';
            } else if (cell[marked]) {
                cell[marked] = false;
                minesLeft++;
                cell.innerHTML = '?';
                cell.className = 'questioned';
            } else {
                cell.innerHTML = '';
                cell.className = '';
            }
            displayMinesLeft();
        };

        const coordsToCell = (x, y) => minefield.rows[y].cells[x];

        const cellToCoords = cell => [cell.cellIndex, cell.parentElement.rowIndex];

        const actionAround = (cell, action) => {
            const [x, y] = cellToCoords(cell);
            for (let i = (x === 0 ? 0 : x - 1); i <= (x === minefieldWidth - 1 ? x : x + 1); i++) {
                for (let j = (y === 0 ? 0 : y - 1); j <= (y === minefieldHeight - 1 ? y : y + 1); j++) {
                    if (i === x && j === y) {
                        continue;
                    }
                    action(i, j);
                }
            }
        };

        const countMinesAround = cell => {
            let minesAround = 0;
            actionAround(cell, (i, j) => minesAround += (coordsToCell(i, j)[armed] || 0));
            return minesAround;
        };

        const timerStop = () => timer.stop();
        const timerStart = () => {
            if (invisibleCover.parentElement !== document.body) {
                timer.start();
            }
        };

        endGame = () => { // removes some eventListeners and stops timer
            gameStarted = false;
            gameFinished = true;

            minefield.removeEventListener('mousedown', catchMouseDown);
            minefield.removeEventListener('mouseup', catchMouseUp);

            window.removeEventListener('blur', timerStop);
            window.removeEventListener('focus', timerStart);
            timer.stop();
        };

        const displayOpenedCell = (cell, number) => {
            const styles = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

            cell.innerHTML = (number === 0) ? '' : String(number);
            cell.className = styles[number];
            cell.classList.add('opened');
        };

        const kingSizeStats = errors => {
            const kingMessage = alertFinalMessage('kingMessage', (errors === undefined) ? 'Победа!!!' : 'Поражение');
            let stats = `Размер поля: ${minefieldWidth}&times;${minefieldHeight}<br>Затраченное время: ${timer.show()}<br>`;

            if (errors === undefined) {
                stats += `Обнаружено мин: ${numberOfMines}, это ${(numberOfMines * 1000 / timer.baseTime).toFixed(2)} мин в секунду`;
                kingMessage.addP(stats);

                const callToKingRecord = async () => {
                    const kingWinForm = new FormData();
                    kingWinForm.append('width', minefieldWidth);
                    kingWinForm.append('height', minefieldHeight);
                    kingWinForm.append('timeset', timer.baseTime);
                    kingWinForm.append('mines', numberOfMines);

                    const resp = await fetch('king_win.php', {
                        method: 'POST',
                        body: kingWinForm
                    });

                    if (resp.ok) {
                        const numId = await resp.text();
                        kingMessage.hideOk();
                        kingMessage.addP('Вы можете сохранить рекорд под своим именем:');
                        const kingNameForm = document.createElement('form');
                        const defaultName = localStorage.getItem('name') || 'anonymous';
                        kingNameForm.innerHTML = `<input type="text" name="name" value="${defaultName}" maxlength="35">` +
                            '<input type="submit" value="Отправить">';

                        kingNameForm.onsubmit = async (event) => {
                            event.preventDefault();
                            document.onmousedown = () => false;

                            const nameEntered = kingNameForm.elements.name.value.trim();
                            localStorage.setItem('name', nameEntered);

                            if (nameEntered !== '' && nameEntered !== 'anomymous') {
                                const nameForm = new FormData(kingNameForm);
                                nameForm.set('record_id', numId);
                                nameForm.set('difficulty', 'king_win');
                                nameForm.set('name', nameEntered);

                                const resp = await fetch('add_name.php', {
                                    method: 'POST',
                                    body: nameForm
                                });

                                kingNameForm.remove();
                                kingMessage.removeLastElement();

                                const msg = await resp.text();
                                kingMessage.addP(msg);
                                kingMessage.showOk();
                            } else {
                                kingNameForm.remove();
                                kingMessage.removeLastElement();
                                kingMessage.showOk();
                            }
                        };

                        document.onmousedown = null;
                        kingMessage.addElement(kingNameForm);

                    } else {
                        kingMessage.addP('(Таблица king-рекордов недоступна)');
                    }
                };

                callToKingRecord();

            } else {
                const found = numberOfMines - minesLeft - errors;

                stats += `Допущено ошибок: ${errors + 1}<br>`;
                const numOfCells = minefieldHeight * minefieldWidth;
                const openedCells = numOfCells - cellsUnopened - numberOfMines + found;

                const statsTable = document.createElement('table');
                statsTable.innerHTML = `<table>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>Из</th>
                                <th>%</th>
                                <th>/с</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>Обнаружено мин</th>
                                <td>${found}</td>
                                <td>${numberOfMines}</td>
                                <td>${(found * 100 / numberOfMines).toFixed(1)}</td>
                                <td>${(found * 1000 / timer.baseTime).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <th>Открыто ячеек</th>
                                <td>${openedCells}</td>
                                <td>${numOfCells}</td>
                                <td>${(openedCells * 100 / numOfCells).toFixed(1)}</td>
                                <td>${(openedCells * 1000 / timer.baseTime).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>`.replace(/\./g, ',');

                const kingLostForm = new FormData();
                kingLostForm.append('width', minefieldWidth);
                kingLostForm.append('height', minefieldHeight);
                kingLostForm.append('timeset', timer.baseTime);
                kingLostForm.append('mines', numberOfMines);
                kingLostForm.append('found', found);
                kingLostForm.append('errors', errors);
                kingLostForm.append('opened', openedCells);

                fetch('king_lost.php', {
                    method: 'POST',
                    body: kingLostForm
                });

                kingMessage.addP(stats);
                kingMessage.addElement(statsTable);
            }
        };

        const gameOverWin = () => {
            const displayRemainingMines = () => {
                const cells = minefield.querySelectorAll('td');
                for (let cell of cells) {
                    if (cell[armed] && !cell[marked]) {
                        toggleCellMarked(cell);
                    }
                }
            };

            const callToRecords = async () => {
                const fData = new FormData();
                fData.set('time', timer.baseTime.toString());
                fData.set('difficulty', difficultyLevel);

                const response = await fetch('records.php', {
                    method: 'POST',
                    body: fData
                });

                if (response.ok) {
                    const answer = await response.json();

                    if (answer.error) {
                        winMessage.addP(answer.error, 'error');
                    } else if (answer.goodness !== 'no') {
                        winMessage.hideOk();
                        winMessage.addP('Поздравляем! Ваш результат вошёл в таблицу рекордов!');
                        const record = winMessage.addP('№' + answer.place, 'record');

                        if (answer.goodness === 'best') {
                            winMessage.addP('Вы можете сохранить его под своим именем:');

                            const enterName = document.createElement('form');
                            const defaultName = localStorage.getItem('name') || 'anonymous';
                            enterName.innerHTML = `<input type="text" name="name" value="${defaultName}" maxlength="25">` +
                                '<input type="submit" value="Отправить">';

                            enterName.onsubmit = async (event) => {
                                document.onmousedown = () => false;
                                event.preventDefault();
                                const nameEntered = enterName.elements.name.value.trim();
                                localStorage.setItem('name', nameEntered);

                                if (nameEntered !== '' && nameEntered !== 'anomymous') {
                                    const nameForm = new FormData(enterName);
                                    nameForm.set('record_id', answer.record_id);
                                    nameForm.set('difficulty', difficultyLevel);
                                    nameForm.set('name', nameEntered);

                                    const resp = await fetch('add_name.php', {
                                        method: 'POST',
                                        body: nameForm
                                    });

                                    enterName.remove();
                                    winMessage.removeLastElement();

                                    const msg = await resp.text();

                                    winMessage.addP(msg);
                                } else {
                                    enterName.remove();
                                    winMessage.removeLastElement();
                                }
                                record.className = 'click-me';
                                record.addEventListener('click', () => winMessage.remove());
                            }

                            document.onmousedown = null;
                            winMessage.addElement(enterName);
                        } else {
                            record.className = 'click-me';
                            record.addEventListener('click', () => winMessage.remove());
                        }
                    }
                } else {
                    addLineToFinalMessage(winMessage, '(Таблица рекордов недоступна)');
                }
            };

            if (minesLeft > 0) {
                displayRemainingMines();
            }

            endGame();

            if (difficultyLevel === 'King Size!') {
                return kingSizeStats();
            }

            const winMessage = alertFinalMessage('winMessage', 'Победа!');

            winMessage.addP(`Уровень сложности: ${difficultyLevel}<br>Время: ${timer.show()}<br>Обнаружено мин: ${numberOfMines}`);

            callToRecords();
        };

        const openCell = cell => {
            if (!cell[opened] && !cell[marked]) {
                const minesAround = countMinesAround(cell);
                cell[opened] = true;
                displayOpenedCell(cell, minesAround);
                if (--cellsUnopened === 0) {
                    gameOverWin();
                }
                if (minesAround === 0) {
                    zeroAroundCells.push(cell);
                }
            }
        };

        const clickAroundZeros = () => {
            const openCellsAround = cell => {
                actionAround(cell, (i, j) => openCell(coordsToCell(i, j)));
            };

            while (zeroAroundCells.length > 0) {
                const cell = zeroAroundCells.pop();
                openCellsAround(cell);
            }
        };

        const catchMouseDown = event => {
            const rightClickProcessor = cell => {
                if (!cell[opened]) {
                    toggleCellMarked(cell);
                }
            };

            const unopenedAround = cell => {
                let unopened = 0;
                actionAround(cell, (i, j) => unopened += (coordsToCell(i, j)[opened] ? 0 : 1));
                return unopened;
            };

            if (event.which === 3) {
                rightPressed = true;
                rightClickProcessor(event.target);
            }

            if (event.which === 1) {
                leftPressed = true;
            }

            if (event.which === 2 && event.target[opened] && +event.target.innerHTML === unopenedAround(event.target)) {
                actionAround(event.target, (i, j) => {
                    if (!coordsToCell(i, j)[opened]) {
                        while (!coordsToCell(i, j)[marked]) {
                            toggleCellMarked(coordsToCell(i, j));
                        }
                    }
                });
            }
        };

        const catchMouseUp = event => {

            const clickProcessor = cell => {

                const gameOverLost = lostCell => {
                    let errors = 0;

                    const displayRemainingMinesLost = () => {
                        const displayBomb = cell => {
                            cell.innerHTML = '💣';
                            cell.className = 'bomb';
                            cell.classList.add('opened');
                        };

                        const cells = minefield.querySelectorAll('td');

                        for (let cell of cells) {
                            if (cell[armed] && !cell[marked]) {
                                displayBomb(cell);
                            }
                            if (cell[marked] && !cell[armed]) {
                                displayBomb(cell);
                                cell.classList.add('redCross');
                                errors++;
                            }
                        }
                    };

                    displayRemainingMinesLost();
                    lostCell.style.backgroundColor = 'red';

                    endGame();

                    if (difficultyLevel === 'King Size!') {
                        return kingSizeStats(errors);
                    }

                    alertFinalMessage('lostMessage', 'Game over');
                };

                if (!cell[opened] && !cell[marked]) {
                    cell[opened] = true;

                    if (cell[armed]) {
                        gameOverLost(cell);
                    } else {
                        const minesAround = countMinesAround(cell);
                        displayOpenedCell(cell, minesAround);
                        if (--cellsUnopened === 0) {
                            gameOverWin();
                        }
                        if (minesAround === 0) {
                            zeroAroundCells.push(cell);
                            clickAroundZeros();
                        }
                    }
                }
            };

            const bothButtnosClickProcessor = cell => {
                const countMarkedAround = cell => {
                    let mines = 0;
                    actionAround(cell, (i, j) => mines += (coordsToCell(i, j)[marked] || 0));
                    return mines;
                };

                if (countMinesAround(cell) === countMarkedAround(cell)) {
                    actionAround(cell, (i, j) => clickProcessor(coordsToCell(i, j)));
                }
            };

            if (leftPressed && rightPressed) {
                bothButtnosClickProcessor(event.target);
            } else if (leftPressed && event.which === 1) {
                clickProcessor(event.target);
            }

            if (event.which === 1) leftPressed = false;
            if (event.which === 3) rightPressed = false;
        };

        const firstClick = cell => {
            const seedMines = () => {
                const generateRandom = (from, to) => from + Math.floor((to - from + 1) * Math.random());

                let cellsArmed = 0;
                while (cellsArmed < numberOfMines) {
                    const x = generateRandom(0, minefieldWidth - 1);
                    const y = generateRandom(0, minefieldHeight - 1);
                    const cell = coordsToCell(x, y);
                    if (cell[armed]) continue;
                    cell[armed] = true;
                    cellsArmed++;
                }
            };

            const reSeedMines = () => {
                const clearMines = () => {
                    const cells = minefield.querySelectorAll('td');
                    for (let cell of cells) {
                        if (cell[armed]) {
                            cell[armed] = false;
                        }
                    }
                };

                clearMines();
                seedMines();
            };

            seedMines();

            while (cell[armed] || countMinesAround(cell) !== 0) {
                reSeedMines();
            }

            gameStarted = true;
            gameFinished = false;
            timer.start();
            window.addEventListener('blur', timerStop);
            window.addEventListener('focus', timerStart);

            openCell(cell);
            clickAroundZeros();

            minefield.addEventListener('mousedown', catchMouseDown);
            minefield.addEventListener('mouseup', catchMouseUp);
        };

        const gameOverReset = () => {
            if (gameStarted !== gameFinished) {
                if (gameStarted) {
                    endGame();
                }

                timer.reset();
                drawMinefield();
                gameFinished = false;
                minefield.addEventListener('click', startNewGame);
            }
        };

        document.getElementById('reset').addEventListener('click', gameOverReset);

        firstClick(event.target);
    };

    minefield.addEventListener('click', startNewGame);

    window.onunload = () => {
        localStorage.setItem('x', minesweeper.offsetLeft - Number.parseInt(body.marginLeft));
        localStorage.setItem('y', minesweeper.offsetTop - Number.parseInt(body.marginTop));
        localStorage.setItem('density', kingDensitySet);
    };
};

function fadeOut(elem, time = 400) {
    const interval = 25; //ms
    let opacity = 1.0;
    const targetTime = Date.now() + time;
    const fader = setInterval(() => {
        if (opacity > 0) {
            elem.style.opacity = opacity;
            opacity = (targetTime - Date.now()) / time;
        } else {
            clearInterval(fader);
            elem.remove();
        }
    }, interval);
}

function fadeIn(where, how, elem, time = 400) {
    const interval = 25; //ms
    let opacity = 0.0;
    elem.style.opacity = 0;
    where.insertAdjacentElement(how, elem);
    const targetTime = Date.now() + time;
    const fader = setInterval(() => {
        if (opacity < 1) {
            elem.style.opacity = opacity;
            opacity = 1 - (targetTime - Date.now()) / time;
        } else {
            clearInterval(fader);
            elem.style.opacity = '';
        }
    }, interval);
}