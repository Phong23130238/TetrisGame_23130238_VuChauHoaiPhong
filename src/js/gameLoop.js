export default class GameLoop {
    constructor() {
        this.timer = null;
    }
    star(callback, interval) {
        this.stop();
        this.timer = setInterval(callback, interval);
    }

    stop(){
        clearInterval(this.timer);
        this.timer = null;
    }

}
