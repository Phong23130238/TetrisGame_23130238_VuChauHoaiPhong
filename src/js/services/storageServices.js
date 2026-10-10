const KEY = "tetrisHighScores";

export function getHighScore(){
    return JSON.parse(localStorage.getItem(KEY)) || [];
}

export function saveHighScore(score){
    const scores =  getHighScore();
    scores.push(score);
    scores.sort((a, b) => b - a);
    localStorage.setItem(KEY, JSON.stringify(scores.slice(0, 5)));
}

export function resetHighScores(){
    localStorage.removeItem(KEY);
}