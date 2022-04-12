var Game = {
    chessdom: null,
    titleNode: document.getElementById("title"),
    levelNode: document.getElementById("level"),
    scoreNode: document.getElementById("score"),
    targetNode: document.getElementById("target"),
    gameoverNode: document.getElementById("gameover"),
    gameoverLevelNode: document.getElementById("end_level"),
    gamepassNode: document.getElementById("pass"),
    gameaddScoreNode: document.getElementById("addScore"),
    chessData2d: null,       
    rowTotal: 9,             // total rows
    colTotal: 9,             // total columns 
    score: 0,                // beginning score
    size: 0,                 
    imgCount: 5,            
    baseNum: 5000,           
    target: 0,            
    level: 1,                // rounds
    increaseNum: 1000,       
    Creator(row, col) {
        var self = this;
        var imgs = ['fire.png', 'pikachu.png', 'psyduck.jpeg', 'ice.jpg', 'bulbasaur.jpeg']
        var node = document.createElement('div');
        node.style.width = this.size + 'px';
        node.style.height = this.size + 'px';
        var img = document.createElement('img');
        img.style.width = '100%';
        img.style.height = '100%';
        node.appendChild(img);
        node.style.position = 'absolute';
        node.style.transition = 'top 0.2s,left 0.2s,opacity 0.2s';
        var target = new Proxy({}, {
            get(obj, prop) {
                return obj[prop];
            },
            set(obj, prop, value) {
                switch (prop) {
                    case 'value':
                        img.src = imgs[value];
                        break;
                    case 'select':
                        if (value) {
                            node.style.opacity = 0.8;
                        } else {
                            node.style.opacity = 1;
                        }
                        break;
                    case 'position':
                        node.style.top = value.row * self.size + 'px';
                        node.style.left = value.col * self.size + 'px';
                        if (obj[prop]) {
                            self.chessData2d[obj[prop].row][obj[prop].col] = undefined;
                        }
                        self.chessData2d[value.row][value.col] = target;
                        break;
                }
                obj[prop] = value;
            }
        })
        target.node = node;
        target.img = img;
        target.value = Math.floor(Math.random() * this.imgCount);
        target.position = { row, col };
        target.select = false;
        target.spread = () => {
            var adjacents = [];
            if (target.position.row > 0) {
                var chess = this.chessData2d[target.position.row - 1][target.position.col];
                if (chess && !chess.select && chess.value == target.value) {
                    adjacents.push(chess);
                }
            }
            if (target.position.row < this.rowTotal - 1) {
                var chess = this.chessData2d[target.position.row + 1][target.position.col];
                if (chess && !chess.select && chess.value == target.value) {
                    adjacents.push(chess);
                }
            }
            if (target.position.col > 0) {
                var chess = this.chessData2d[target.position.row][target.position.col - 1];
                if (chess && !chess.select && chess.value == target.value) {
                    adjacents.push(chess);
                }
            }
            if (target.position.col < this.colTotal - 1) {
                var chess = this.chessData2d[target.position.row][target.position.col + 1];
                if (chess && !chess.select && chess.value == target.value) {
                    adjacents.push(chess);
                }
            }
            for (var i = 0; i < adjacents.length; i++) {
                var chess = adjacents[i];
                chess.select = true;
                chess.spread();
            }
            return;
        }
        node.onclick = async () => {
            if (target.select) {
                // remove selected dom
                var needRemove = []
                for (var row = 0; row < this.chessData2d.length; row++) {
                    for (var col = 0; col < this.chessData2d[row].length; col++) {
                        var chessdata = this.chessData2d[row][col];
                        if (chessdata && chessdata.select) {
                            needRemove.push(chessdata)
                        }
                    }
                }
                const count = needRemove.length;
                if (count > 1) {
                    for (var i = 0; i < count; i++) {
                        var chessdata = needRemove[i];
                        chessdata.node.style.opacity = 0;
                        chessdata.node.remove();
                        var row = chessdata.position.row;
                        var col = chessdata.position.col;
                        chessdata.delete = true;
                        this.chessData2d[row][col] = undefined;
                    }
                    if (count <= 10) {
                        this.score += Math.pow(2, count);
                    } else {
                        this.score += Math.pow(2, 10) + (count - 10) * 512;
                    }
                    this.updateScore();
                    await this.move();
                    this.next();
                }

            } else {
                
                for (var row = 0; row < this.chessData2d.length; row++) {
                    for (var col = 0; col < this.chessData2d[row].length; col++) {
                        if (this.chessData2d[row][col]) {
                            this.chessData2d[row][col].select = false
                        }
                    }
                }

                
                target.select = true;
                
                target.spread(target.value);
            }
        }

        return target
    },

    
    createChessData() {
        this.chessData2d = [];
        for (var i = 0; i < this.rowTotal; i++) {
            this.chessData2d[i] = [];
            for (var j = 0; j < this.colTotal; j++) {
                var chess = this.Creator(i, j);
            }
        }
    },

    // 
    async colMoveDown(c) {
        var moveStep = 0;
        for (var r = this.rowTotal - 1; r >= 0; r--) {
            if (!this.chessData2d[r][c]) {
                moveStep++
            } else {
                if (moveStep) {
                    var chess = this.chessData2d[r][c]
                    var position = chess.position;

                    await new Promise(resolve => {
                        setTimeout(() => {
                            chess.position = {
                                row: position.row + moveStep,
                                col: position.col
                            }
                            resolve()
                        }, 20);
                    })
                }
            }
        }
        moveStep = 0;
    },
    isEmptyCol(c) {
        for (var r = 0; r < this.rowTotal; r++) {
            if (this.chessData2d[r][c]) {
                return false;
            }
        }
        return true;
    },
    async moveColLeftByStep(c, step) {
        if (step) {
            for (var r = 0; r < this.rowTotal; r++) {
                var chess = this.chessData2d[r][c];
                if (chess) {
                    position = chess.position
                    await new Promise(resolve => {
                        setTimeout(() => {
                            this.chessData2d[r][c] = undefined;
                            chess.position = {
                                row: position.row,
                                col: position.col - step,
                            }
                            resolve();
                        }, 20);
                    })
                }
            }
        }
    },
    async move() {
        
        var moveColStep = 0;
        for (var c = 0; c < this.colTotal; c++) {
            if (this.isEmptyCol(c)) { moveColStep++ };
            await this.colMoveDown(c);
            await this.moveColLeftByStep(c, moveColStep);
        }

    },
    start() {
        this.score = 0;
        this.target = 0;
        this.level = 1;
        this.setSize();
        this.target += this.baseNum + (this.level - 1) * this.increaseNum;
        this.updatetarge();
        this.updateLevel();
        this.updateScore();
        this.hiddenMode();
        this.createChessDom();
        window.onresize = () => {
            this.resetDomWidth()
        };
    },
    createChessDom() {
        if (this.chessdom) {
            document.body.removeChild(this.chessdom);
        }
        this.chessdom = document.createElement('div')
        var chessdom = this.chessdom;
        chessdom.style.height = this.colTotal * this.size + 'px';
        chessdom.style.width = this.rowTotal * this.size + 'px';
        this.titleNode.style.width = this.rowTotal * this.size + 'px';
        chessdom.style.position = 'relative';
        chessdom.style.margin = '10px auto';
        this.createChessData();
        for (var row = 0; row < this.chessData2d.length; row++) {
            for (var col = 0; col < this.chessData2d[row].length; col++) {
                if (this.chessData2d[row][col]) {
                    chessdom.appendChild(this.chessData2d[row][col].node);
                }
            }
        }
        document.body.appendChild(chessdom);
    },
    hiddenMode() {
        this.gamepassNode.style.display = "none";
        this.gameoverNode.style.display = "none";
    },
    updatetarge() {
        this.targetNode.innerHTML = this.target;
    },
    updateLevel() {
        this.levelNode.innerHTML = this.level;
    },
    updateScore() {
        this.scoreNode.innerHTML = this.score;
        if (this.score >= this.target) {
            this.scoreNode.style.color = "green";
        } else {
            this.scoreNode.style.color = "red";
        }
    },
    setSize() {
        if (document.documentElement.clientHeight - 100 >= document.documentElement.clientWidth) {
            this.size = parseFloat((document.documentElement.clientWidth - 20) / this.colTotal);
        } else {
            this.size = parseFloat((document.documentElement.clientHeight - 100) / this.rowTotal);
        }
    },
    resetDomWidth() {
        this.setSize();
        const chessdom = this.chessdom;
        chessdom.style.height = this.colTotal * this.size + 'px';
        chessdom.style.width = this.rowTotal * this.size + 'px';
        this.titleNode.style.width = this.rowTotal * this.size + 'px';
        this.chessData2d.map(row => {
            row.map(target => {
                if (target) {
                    target.position = target.position;
                    target.node.style.width = this.size + 'px';
                    target.node.style.height = this.size + 'px';
                }
            })
        })
    },
    isOver() {
        for (var R = 0; R < this.chessData2d.length; R++) {
            for (var C = 0; C < this.chessData2d[R].length; C++) {
                if (this.chessData2d[R][C]) {
                    var chess = this.chessData2d[R][C];
                    const { row, col } = chess.position;
                    const value = chess.value;
                    if (this.chessData2d[row - 1] && this.chessData2d[row - 1][col] && this.chessData2d[row - 1][col].value == value) {
                        return false;
                    } else if (this.chessData2d[row][col + 1] && this.chessData2d[row][col + 1].value == value) {
                        return false;
                    }
                }
            }
        }
        return true;
    },
    next() {
        if (this.isOver()) {
            var i = this.restNumber();
            if (i <= 10) {
                this.score += Math.floor(2000 / i);
                if (this.score >= this.target) {
                    this.gameaddScoreNode.innerHTML = `SCORE:+${Math.floor(2000 / i)}`;
                    this.gamepassNode.style.display = "block";
                    setTimeout(() => {
                        this.scoreNode.innerHTML = this.score;
                    }, 1000);
                } else {
                    this.gameoverLevelNode.innerHTML = this.level - 1;
                    this.gameoverNode.style.display = "block";
                }
            } else {
                if (this.score >= this.target) {
                    this.gameaddScoreNode.innerHTML = `SCORE:+ 0`;
                    this.gamepassNode.style.display = "block";
                } else {
                    this.gameoverLevelNode.innerHTML = this.level - 1;
                    this.gameoverNode.style.display = "block";
                }
            }
        }
    },
    restNumber() {
        var count = 0;
        for (var row = 0; row < this.chessData2d.length; row++) {
            for (var col = 0; col < this.chessData2d[row].length; col++) {
                if (this.chessData2d[row][col]) {
                    count++;
                }
            }
        }
        return count;
    },
    pass() {
        this.level += 1;
        this.updateLevel();
        this.gamepassNode.style.display = "none";
        this.target += this.baseNum + (this.level - 1) * this.increaseNum;
        this.updatetarge();
        this.updateScore();
        this.createChessDom();
    }
};
Game.start()