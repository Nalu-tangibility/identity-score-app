// LocalStorageのキー
const STORAGE_KEY = 'identityEvaluations';

// 評価履歴を保存する関数
function saveToHistory(evaluation) {
    const history = getHistory();
    history.push({
        ...evaluation,
        date: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// 評価履歴を取得する関数
function getHistory() {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
}

// スコアを計算する関数
function calculateScore(universality, frequency, duration, monthsAgo) {
    // 要因aの計算: 1/m + log(1+t) + log(1+d) + (24-p)/24
    const score = (1 / universality) + 
                 Math.log(1 + frequency) + 
                 Math.log(1 + duration) + 
                 (24 - Math.min(monthsAgo, 24)) / 24;
    
    // 小数点第2位までで四捨五入
    return Math.round(score * 100) / 100;
}

// 評価結果を表示する関数
function displayScore(score, evaluation) {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.innerHTML = `
        <h3>評価スコア: ${score}</h3>
        <p>対象者: ${evaluation.personName || '名前なし'}</p>
        <p>普遍性(m): ${evaluation.universality}人</p>
        <p>体験量(t): ${evaluation.frequency}回</p>
        <p>継続期間(d): ${evaluation.duration}ヶ月</p>
        <p>過去性(p): ${evaluation.monthsAgo}ヶ月前</p>
    `;
}

// 履歴を表示する関数
function displayHistory() {
    const historyList = document.getElementById('historyList');
    const history = getHistory();
    
    historyList.innerHTML = history.reverse().map(item => `
        <div class="history-item">
            <h4>${item.personName || '名前なし'} - ${new Date(item.date).toLocaleDateString()}</h4>
            <p>評価スコア: ${item.score}</p>
            <p>普遍性: ${item.universality}人 / 体験量: ${item.frequency}回</p>
            <p>継続期間: ${item.duration}ヶ月 / 過去性: ${item.monthsAgo}ヶ月前</p>
            <button onclick="deleteEvaluation(${item.id})" class="delete-btn">削除</button>
        </div>
    `).join('');
}

// 評価を削除する関数
function deleteEvaluation(id) {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    displayHistory();
}

// フォームの送信イベントを処理
document.getElementById('evaluationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const evaluation = {
        personName: document.getElementById('personName').value,
        universality: parseInt(document.getElementById('universality').value),
        frequency: parseInt(document.getElementById('frequency').value),
        duration: parseInt(document.getElementById('duration').value),
        monthsAgo: parseInt(document.getElementById('monthsAgo').value)
    };

    const score = calculateScore(
        evaluation.universality,
        evaluation.frequency,
        evaluation.duration,
        evaluation.monthsAgo
    );

    evaluation.score = score;
    
    // 結果を表示
    displayScore(score, evaluation);
    
    // 履歴に保存
    saveToHistory(evaluation);
    
    // 履歴を更新
    displayHistory();
    
    // フォームをリセット
    this.reset();
});

// 初期表示時に履歴を表示
document.addEventListener('DOMContentLoaded', displayHistory);