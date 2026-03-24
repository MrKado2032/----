// フィールドを定義
const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 20;

// ブロックのサイズを定義
const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;

// ゲーム世界の処理間隔 (ms)
const GAME_INTERVAL = 1000;

// Canvasの取得
const canvas = document.querySelector("#gameCanvas");

// CanvasRenderingContext2Dのインスタンスを取得
const context = canvas.getContext("2d");

// ミノ形状データ (要件通り5種類)
const MINO_SHAPE_DATAS = [
    {shape: 
        [
            [0, 1, 0], 
            [1, 1, 1], 
            [0, 0, 0]
        ], 
        color: "purple"},     // T字
    {shape: 
        [
            [0, 1, 0], 
            [0, 1, 0], 
            [0, 1, 1]
        ], 
        color: "orange"},     // L字
    {shape: 
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1], 
            [0, 0, 0, 0],  
            [0, 0, 0, 0], 
        ], 
        color: "skyblue"},    // I字
    {shape: 
        [
            [1, 1], 
            [1, 1]
        ], 
        color: "yellow"},     // O字
    {shape: 
        [
            [1, 1, 0],
            [0, 1, 1], 
            [0, 0, 0]
        ], 
        color: "red"},        // Z字
];

// フィールを管理するクラス
class FieldManager{

    // フィールドデータ
    #fieldData = [];

    constructor(){
        this.#initializeFieldData();
        this.#drawField();
    }

    // リセット処理
    reset(){
        this.#initializeFieldData();
    }

    // フィードデータを初期化
    #initializeFieldData(){
        for(let i = 0; i < FIELD_HEIGHT; i++){
            this.#fieldData[i] = [];
            for(let j = 0; j < FIELD_WIDTH; j++){
                this.#fieldData[i][j] = 0;
            }
        }
    }

    // フィールドを描画
    #drawField(){

        context.beginPath();
        context.strokeStyle = "gray";

        for(let i = 0; i < this.#fieldData.length; i++){
            if(this.#fieldData[i][0] === 0){
                context.strokeRect(0, i * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_HEIGHT);
            }

            for(let j = 0; j < this.#fieldData[i].length; j++){
                if(this.#fieldData[i][j] === 0){
                    context.strokeRect(j * BLOCK_WIDTH, i * BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
                }
                else{   // おかれているミノを描画
                    context.fillStyle = this.#fieldData[i][j];
                    context.fillRect(j * BLOCK_WIDTH, i * BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
                    context.strokeRect(j * BLOCK_WIDTH, i * BLOCK_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
                }
            }
        }

        context.closePath();
    }

    // 描画処理
    render(){
        
        context.beginPath();
        this.#drawField();
        context.closePath();
    }

    // ミノが移動可能か
    canMove(minoX, minoY, minoData){
        for(let i = 0; i < minoData.length; i++){
            for(let j = 0; j < minoData[i].length; j++){

                if(minoData[i][j] === 1){
                    let targetX = minoX + j;
                    let targetY = minoY + i;

                    if(targetX < 0 || targetX >= FIELD_WIDTH || targetY >= FIELD_HEIGHT){
                        return false;
                    }

                    if(targetX >= 0 && this.#fieldData[targetY][targetX] !== 0){
                        return false;
                    }
                }

            }
        }
        return true;
    }

    // ミノデータをフィールド上に書き込む
    writeFieldDataFromMinoData(mino){

        const color = mino.getColor();

        for(let i = 0; i < mino.getMinoData().length; i++){
            for(let j = 0; j < mino.getMinoData()[i].length; j++){

                if(mino.getMinoData()[i][j] === 1){
                    const posX = mino.getCurrentPosX() + j;
                    const posY = mino.getCurrentPosY() + i;

                    this.#fieldData[posY][posX] = color;
                }

            }
        }
    }

    // そろった列を消す処理
    removeCompletedLine(){

        let removedCount = 0;
        for(let i = FIELD_HEIGHT - 1; i >= 0; i--){

            if(this.#isCompletedLine(this.#fieldData[i])){

                this.#fieldData.splice(i, 1);

                const newRow = new Array(FIELD_WIDTH).fill(0);
                this.#fieldData.unshift(newRow);

                i++;
                removedCount++;
            }

        }

        return removedCount;

    }

    // 一列そろったかの判定
    #isCompletedLine(lineData){

        for(let i = 0; i < lineData.length; i++){

            if(lineData[i] === 0){
                return false;
            }

        }

        return true;

    }
}

// テトリミノクラス
class Tetorimino{

    #isMovable = true;
    #color;
    #minoData = [[]];
    #posX = 0;
    #posY = 0;

    constructor(minoData, color, initX = 3, initY = 0){
        this.#minoData = minoData;
        this.#color = color;
        this.#posX = initX;
        this.#posY = initY;
    }

    // テトリミノ描画
    #drawMino(ctx){

        ctx.fillStyle = this.#color;
        for(let i = 0; i < this.#minoData.length; i++){
            for(let j = 0; j < this.#minoData[i].length; j++){
                if(this.#minoData[i][j] === 1){
                    const drawX = (this.#posX + j) * BLOCK_WIDTH;
                    const drawY = (this.#posY + i) * BLOCK_HEIGHT;

                    ctx.fillRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);

                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);
                }
            }
        }
    }

    // ミノデータの行列を取得
    getMinoData(){
        return this.#minoData;
    }

    // 現在のX座標を取得
    getCurrentPosX(){
        return this.#posX;
    }

    // 現在のY座標を取得
    getCurrentPosY(){
        return this.#posY;
    }

    // 色を取得
    getColor(){
        return this.#color;
    }

    // 固定処理
    freeze(){
        this.#isMovable = false;
    }

    // 移動処理
    move(x, y){
        this.#posX += x;
        this.#posY += y;
    }

    // 回転処理 (90度CW固定)
    getCWRotatedMatrix(){

        const n = this.#minoData.length;
        const m = this.#minoData[0].length;
        
        const newMinoData = Array.from({ length: m }, () => Array(n).fill(0));

        for(let i = 0; i < n; i++){
            for(let j = 0; j < m; j++){

                const oldArray = this.#minoData.map(row => [...row]);
                newMinoData[j][n - 1 -i] = this.#minoData[i][j];

            }
        }

        return newMinoData;

    }
    
    setMinoData(minoData){
        this.#minoData = minoData.shape;
        this.#color = minoData.color;
    }

    // ミノ行列のセット
    setMinoMatrix(matrix){
        this.#minoData = matrix;
    }

    // 更新処理
    update(){
        this.#posY++;
    }

    // 移動可能か
    getIsMovalbe(){
        return this.#isMovable;
    }

    // 描画
    render(ctx){
        ctx.beginPath();
        this.#drawMino(ctx);
        ctx.closePath();
    }

}

// スコアクラス
class Score{

    #value = 0;
    #onChanged = null;

    constructor(value, onChanged){
        this.#value = value;
        this.#onChanged = onChanged;
    }

    addValue(value){
        this.#value += value;
        if(this.#onChanged) this.#onChanged(this.#value);
    }

    getValue(){
        return this.#value;
    }

}

// スコア計算クラス
class ScoreCalculator{

    static #basePoint = 100;

    // 消されたラインの数によってスコア計算
    static calcScoreFromRemovedLineCount(removedLineCount){
        return this.#basePoint * removedLineCount;
    }

}

// UI管理クラス
class UIManager{

    #scoreContext;
    #nextContext;
    #holdContext;

    constructor(){

        const scCanvas = document.querySelector("#scoreCanvas");
        this.#scoreContext = scCanvas.getContext("2d");

        const nextCanvas = document.querySelector("#nextCanvas");
        this.#nextContext = nextCanvas.getContext("2d");

        const holdCanvas = document.querySelector("#holdCanvas");
        this.#holdContext = holdCanvas.getContext("2d");

        // スコアテキストの取得
        this.setScoreText(0);

    }

    // ホールドコンテナUIの更新 
    #setHoldContainerFromMinoContainer(minoData){

        const holdCanvas = document.querySelector("#holdCanvas");
        this.#holdContext.clearRect(0, 0, holdCanvas.width, holdCanvas.height);

        // テキスト表示
        this.#holdContext.fillStyle = "white";
        this.#holdContext.font = "20px Arial";
        this.#holdContext.fillText("HOLD (H Key)", 10, 30);

        for(let i = 0; i < minoData.shape.length; i++){
            for(let j = 0; j < minoData.shape[i].length; j++){
                if(minoData.shape[i][j] === 1){
                    const drawX = 10 + j * BLOCK_WIDTH;
                    const drawY = 50 + i * BLOCK_HEIGHT;
                    this.#holdContext.fillStyle = minoData.color;
                    this.#holdContext.fillRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);
                    this.#holdContext.strokeStyle = "black";
                    this.#holdContext.lineWidth = 1;
                    this.#holdContext.strokeRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);
                }
            }
        }

    }

    // ホールドミノのセット
    setHoldMino(minoData){
        this.#setHoldContainerFromMinoContainer(minoData);
    }

    // スコアテキストの更新
    setScoreText(scoreValue){

        const scCanvas = document.querySelector("#scoreCanvas");
        this.#scoreContext.clearRect(0, 0, scCanvas.width, scCanvas.height);

        this.#scoreContext.fillStyle = "white";
        this.#scoreContext.font = "20px Arial"; 
        this.#scoreContext.fillText(`SCORE: ${String(scoreValue).padStart(5, "0")}`, 10, 30);
    }

    // NEXTコンテナUIの更新 (ミノが格納されているコンテナを参照)
    setNextContainerFromMinoContainer(minoContainer){

        const nextCanvas = document.querySelector("#nextCanvas");
        this.#nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

        // テキスト表示
        this.#nextContext.fillStyle = "white";
        this.#nextContext.font = "20px Arial";
        this.#nextContext.fillText("NEXT", 10, 30);

        // 引数に渡されたミノコンテナの先頭のミノを描画
        if(minoContainer){
            const minoData = minoContainer.getMinoData();
            const color = minoContainer.getColor();
            for(let i = 0; i < minoData.length; i++){
                for(let j = 0; j < minoData[i].length; j++){
                    if(minoData[i][j] === 1){
                        const drawX = 10 + j * BLOCK_WIDTH;
                        const drawY = 50 + i * BLOCK_HEIGHT;
                        this.#nextContext.fillStyle = color;
                        this.#nextContext.fillRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);
                        this.#nextContext.strokeStyle = "black";
                        this.#nextContext.lineWidth = 1;
                        this.#nextContext.strokeRect(drawX, drawY, BLOCK_WIDTH, BLOCK_HEIGHT);
                    }
                }
            }
    
        }   
    }
}

// ミノスポーンクラス
class MinoSpawner{

    #minoContainer = [];
    #nextIndex = MINO_SHAPE_DATAS.length - 1;

    constructor(){

        MINO_SHAPE_DATAS.forEach( data => {

            this.#minoContainer.push(data);

        });

        this.#minoContainer = this.#shuffle();

    }

    #shuffle(){

        // 自作のシャフルアルゴリズムでしたが、パフォーマンスがわるいみたいです。
        // const container = [];
        // const parsedIndex = [];
        // for(let i = 0; i < MINO_SHAPE_DATAS.length; i++){
        
        //     let minoIndex = Math.floor(Math.random() * MINO_SHAPE_DATAS.length);
        //     while(parsedIndex.includes(minoIndex)){
        //         minoIndex = Math.floor(Math.random() * MINO_SHAPE_DATAS.length);
        //     }

        //     container.push(MINO_SHAPE_DATAS[minoIndex]);
        //     parsedIndex.push(minoIndex);

        // }

        // Fisher-Yates Shuffleアルゴリズムがいいみたい。
        const container = [...MINO_SHAPE_DATAS];
        for(let i = container.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [container[i], container[j]] = [container[j], container[i]];
        }

        return container;
    }

    // 操作するミノを取得
    getNextMino(){

        if(this.#minoContainer.length > 1){

            const nextMino = this.#minoContainer.pop();
            this.#nextIndex--;
            return new Tetorimino(nextMino.shape, nextMino.color);

        }
        else if(this.#minoContainer.length === 1){

            const nextMino = this.#minoContainer.pop();
            this.#minoContainer = this.#shuffle();
            this.#nextIndex = MINO_SHAPE_DATAS.length - 1;

            return new Tetorimino(nextMino.shape, nextMino.color);

        }

    }

    // 操作中の次のミノを取得   
    getNextNextMino(){
        const minoData = this.#minoContainer[this.#nextIndex];
        return new Tetorimino(minoData.shape, minoData.color);
    }

}

// ゲーム管理クラス
class GameManager{

    #requestID;
    #fieldManager;
    #uiManager;
    #minoSpawner;

    // 現在操作中のミノ
    #activeMino;
    #holdMino = null;
    #isHoldUsed = false; // ホールド使用フラグ (trueのときホールド使用済みで、次のミノがスポーンされたときにfalseにリセットされる)

    // 時間関連
    #dropCount = 0;
    #lastTime = 0;
    #timePadding = 0;

    #currentScore = null; // ゲームスコア

    #isMovingDown = false;

    constructor(){

        this.#uiManager = new UIManager();
        this.#fieldManager = new FieldManager();
        this.#minoSpawner = new MinoSpawner();

        this.#holdMino = MINO_SHAPE_DATAS[Math.floor(Math.random() * MINO_SHAPE_DATAS.length)];

        this.#currentScore = new Score(0, value => {
            this.#updateLevelFromScore();
            this.#uiManager.setScoreText(value);
        });

        this.#spawnMino();
        // 各キー入力のイベント処理
        window.addEventListener("keydown", e => {
            if(e.key === "ArrowRight"){     // 右矢印キー (右移動)
                this.#moveMino(1, 0);
            }
            else if(e.key === "ArrowLeft"){ // 左矢印キー (左移動)
                this.#moveMino(-1, 0);
            }
            else if(e.key === "ArrowDown"){ // 下矢印キー (下移動)
                this.#moveMino(0, 1);
            }
            else if(e.key === " "){         // スペースキー (CW90度回転)
                this.#rotateMino();
            }
            else if((e.key === "h" || e.key === "H") && !this.#isHoldUsed){ // Hキー (ホールド)
                this.#activeMino.setMinoData(this.#holdMino);
                this.#holdMino = MINO_SHAPE_DATAS[Math.floor(Math.random() * MINO_SHAPE_DATAS.length)];
                this.#isHoldUsed = true;
            }
        });

        this.#requestID = requestAnimationFrame(time => this.#run(time));
    }

    // メインループ
    #run(time){

        if(!this.#lastTime) this.#lastTime = time;

        const dt = time - this.#lastTime;
        this.#lastTime = time;

        this.#render();
        this.#update(dt);

        this.#requestID = requestAnimationFrame(time => this.#run(time));
    }

    // 難易度調整
    #updateLevelFromScore(){

        if(this.#currentScore.getValue() > 10000){
            this.#timePadding = (GAME_INTERVAL);
        }
        else if(this.#currentScore.getValue() > 7000){
            this.#timePadding = (GAME_INTERVAL / 1.2);
        }
        else if(this.#currentScore.getValue() > 5000){
            this.#timePadding = (GAME_INTERVAL / 1.4);
        }
        else if(this.#currentScore.getValue() > 3000){
            this.#timePadding = (GAME_INTERVAL / 1.8);
        }
        else if(this.#currentScore.getValue() > 1000){
            this.#timePadding = (GAME_INTERVAL / 2)
        }
        else if(this.#currentScore.getValue() > 500){
            this.#timePadding = (GAME_INTERVAL / 3)
        }
        else {
            this.#timePadding = 0;
        }
    }

    // ゲームオーバー処理
    #gameOver(){

        cancelAnimationFrame(this.#requestID);

        alert(`GAME OVER\nあなたのスコア: ${this.#currentScore.getValue()}`);

        this.#fieldManager.reset();
        this.#dropCount = 0;
        this.#lastTime = 0;

        this.#spawnMino();

        this.#requestID = requestAnimationFrame(time => this.#run(time));

    }

    // ミノを移動する
    #moveMino(dx, dy){

        if(!this.#activeMino.getIsMovalbe()) return;

        const nextX = this.#activeMino.getCurrentPosX() + dx;
        const nextY = this.#activeMino.getCurrentPosY() + dy;

        if(this.#fieldManager.canMove(nextX, nextY, this.#activeMino.getMinoData())){
            this.#activeMino.move(dx, dy);
        }
        else{
            this.#isMovingDown = false;
        }
    }

    // ミノ回転処理
    #rotateMino(){

        if(!this.#activeMino.getIsMovalbe()) return;

        const rotatedMinoMatrix = this.#activeMino.getCWRotatedMatrix();

        if(this.#fieldManager.canMove(this.#activeMino.getCurrentPosX(), this.#activeMino.getCurrentPosY(), rotatedMinoMatrix)){
            this.#activeMino.setMinoMatrix(rotatedMinoMatrix);
        }

    }

    // ミノをスポーン
    #spawnMino(){

        this.#activeMino = this.#minoSpawner.getNextMino();
        this.#isHoldUsed = false;

        if(!this.#fieldManager.canMove(this.#activeMino.getCurrentPosX(), this.#activeMino.getCurrentPosY(), this.#activeMino.getMinoData())){
            this.#activeMino.render(context);
            this.#gameOver();
        }

    }

    // 更新処理
    #update(dt){
        
        // 1秒経過処理
        if(this.#isMovingDown) {
            this.#dropCount = 0;
            return;
        }
        this.#dropCount += dt;
        if(this.#dropCount > (GAME_INTERVAL - this.#timePadding)){
            if(this.#fieldManager.canMove(this.#activeMino.getCurrentPosX(), this.#activeMino.getCurrentPosY() + 1, this.#activeMino.getMinoData()) && !this.#isMovingDown){
                this.#activeMino.update();
            }
            else{
                // ミノ固定
                this.#activeMino.freeze();

                // 現在の固定されたミノデータをフィールドデータに書き込む
                this.#fieldManager.writeFieldDataFromMinoData(this.#activeMino);

                // そろったラインを消す
                const removedCount = this.#fieldManager.removeCompletedLine();

                // 消されたライン数によってスコアを加算
                this.#currentScore.addValue(ScoreCalculator.calcScoreFromRemovedLineCount(removedCount));

                // 次のミノを出す
                this.#spawnMino();
            }
            this.#dropCount = 0;
        }

        this.#uiManager.setNextContainerFromMinoContainer(this.#minoSpawner.getNextNextMino());
        this.#uiManager.setHoldMino(this.#holdMino);

    }

    // 描画処理
    #render(){

        context.clearRect(0, 0, canvas.width, canvas.height);

        this.#fieldManager.render();
        this.#activeMino.render(context);
        this.#renderGhostMino();

    }

    // 将来、操作中のミノがどこに落ちるのかを表示する機能
    #renderGhostMino(){

        for(let y = this.#activeMino.getCurrentPosY(); y < FIELD_HEIGHT; y++){

            if(this.#fieldManager.canMove(this.#activeMino.getCurrentPosX(), y, this.#activeMino.getMinoData())){
                continue;
            } 
            else{
                // ゴーストミノの描画
                const ghostMino = new Tetorimino(this.#activeMino.getMinoData(), "rgba(255, 255, 255, 0.5)", this.#activeMino.getCurrentPosX(), y - 1);
                ghostMino.render(context);
                break;
            }

        }
    }

}

// ゲームインスタンスを作成してゲームを開始
const gameMgr = new GameManager();