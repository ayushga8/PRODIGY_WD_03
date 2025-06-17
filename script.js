document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0 };
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let startingPlayer = 'X';
    let difficulty = 'medium'; // 'easy', 'medium', 'hard'
    
    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const playerXEl = document.getElementById('playerX');
    const playerOEl = document.getElementById('playerO');
    const scoreXEl = document.getElementById('scoreX');
    const scoreOEl = document.getElementById('scoreO');
    const boardEl = document.getElementById('board');
    const newGameBtn = document.getElementById('newGameBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const resultModal = document.getElementById('resultModal');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const settingsModal = document.getElementById('settingsModal');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const particlesEl = document.getElementById('particles');
    
    // Create animated background particles
    function createParticles() {
        const particleCount = window.innerWidth < 600 ? 30 : 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random properties
            const size = Math.random() * 5 + 2;
            const posX = Math.random() * window.innerWidth;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 10;
            const opacity = Math.random() * 0.5 + 0.1;
            
            // Apply styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}px`;
            particle.style.top = `${Math.random() * window.innerHeight}px`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.opacity = opacity;
            
            particlesEl.appendChild(particle);
        }
    }
    
    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize game
    function initGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = startingPlayer;
        updatePlayerDisplay();
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'win');
        });
    }
    
    // Update player display
    function updatePlayerDisplay() {
        playerXEl.classList.toggle('active', currentPlayer === 'X');
        playerOEl.classList.toggle('active', currentPlayer === 'O');
    }
    
    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already filled or game not active, return
        if (board[clickedCellIndex] !== '' || !gameActive) return;
        
        // Play sound
        playSound('click');
        
        // Update board
        board[clickedCellIndex] = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (checkWin()) {
            handleWin();
        } else if (checkDraw()) {
            handleDraw();
        } else {
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updatePlayerDisplay();
            
            // If playing against computer and it's computer's turn
            if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
                setTimeout(makeComputerMove, 500);
            }
        }
    }
    
    // Check for win
    function checkWin() {
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return board[index] === currentPlayer;
            });
        });
    }
    
    // Check for draw
    function checkDraw() {
        return board.every(cell => cell !== '');
    }
    
    // Handle win
    function handleWin() {
        gameActive = false;
        scores[currentPlayer]++;
        updateScores();
        
        // Highlight winning cells
        const winningCombo = winningCombinations.find(combination => {
            return combination.every(index => board[index] === currentPlayer);
        });
        
        winningCombo.forEach(index => {
            cells[index].classList.add('win');
        });
        
        // Show result modal
        resultTitle.textContent = `${currentPlayer} Wins!`;
        resultMessage.textContent = `Player ${currentPlayer} has won the game!`;
        resultModal.classList.add('active');
        
        // Play sound
        playSound('win');
        
        // Create confetti effect
        createConfetti();
    }
    
    // Handle draw
    function handleDraw() {
        gameActive = false;
        resultTitle.textContent = 'Draw!';
        resultMessage.textContent = 'The game ended in a draw!';
        resultModal.classList.add('active');
        
        // Play sound
        playSound('draw');
    }
    
    // Update scores
    function updateScores() {
        scoreXEl.textContent = scores.X;
        scoreOEl.textContent = scores.O;
    }
    
    // Computer move with different difficulty levels
    function makeComputerMove() {
        if (!gameActive) return;
        
        let move;
        
        switch(difficulty) {
            case 'easy':
                move = getRandomMove();
                break;
            case 'medium':
                // 70% chance to make smart move, 30% random
                move = Math.random() < 0.7 ? getSmartMove() : getRandomMove();
                break;
            case 'hard':
                move = getBestMove();
                break;
            default:
                move = getSmartMove();
        }
        
        if (move !== -1) {
            setTimeout(() => {
                board[move] = 'O';
                cells[move].classList.add('o');
                playSound('click');
                
                if (checkWin()) {
                    handleWin();
                } else if (checkDraw()) {
                    handleDraw();
                } else {
                    currentPlayer = 'X';
                    updatePlayerDisplay();
                }
            }, 500);
        }
    }
    
    // Get random available move
    function getRandomMove() {
        const availableCells = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        return availableCells.length > 0 ? 
            availableCells[Math.floor(Math.random() * availableCells.length)] : -1;
    }
    
    // Get smart move (tries to win or block)
    function getSmartMove() {
        // Try to win if possible
        let move = findWinningMove('O');
        if (move !== -1) return move;
        
        // Block player from winning
        move = findWinningMove('X');
        if (move !== -1) return move;
        
        // Take center if available
        if (board[4] === '') return 4;
        
        // Take a corner if available
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available cell
        return getRandomMove();
    }
    
    // Find winning move for a player
    function findWinningMove(player) {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] === player && board[b] === player && board[c] === '') return c;
            if (board[a] === player && board[c] === player && board[b] === '') return b;
            if (board[b] === player && board[c] === player && board[a] === '') return a;
        }
        return -1;
    }
    
    // Minimax algorithm for unbeatable AI (hard difficulty)
    function getBestMove() {
        let bestScore = -Infinity;
        let move;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        return move;
    }
    
    function minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (checkWinFor('O')) return 10 - depth;
        if (checkWinFor('X')) return depth - 10;
        if (checkDraw()) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    function checkWinFor(player) {
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return board[index] === player;
            });
        });
    }
    
    // Create confetti effect
    function createConfetti() {
        const container = document.querySelector('.container');
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-10px`;
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
    
    // Play sound effects
    function playSound(type) {
        // In a real implementation, you would use the Web Audio API
        // or play audio files here. This is a placeholder.
        console.log(`Playing ${type} sound`);
    }
    
    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    newGameBtn.addEventListener('click', () => {
        scores = { X: 0, O: 0 };
        updateScores();
        initGame();
        playSound('click');
    });
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        playSound('click');
    });
    
    playAgainBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
        initGame();
        playSound('click');
    });
    
    saveSettingsBtn.addEventListener('click', () => {
        gameMode = document.querySelector('input[name="gameMode"]:checked').value;
        startingPlayer = document.querySelector('input[name="startingPlayer"]:checked').value;
        difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        settingsModal.classList.remove('active');
        initGame();
        playSound('click');
    });
    
    // Close modals when clicking outside
    [resultModal, settingsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                playSound('click');
            }
        });
    });
    
    // Initialize the game and create particles
    initGame();
    createParticles();
    
    // Responsive particles on resize
    window.addEventListener('resize', () => {
        particlesEl.innerHTML = '';
        createParticles();
    });
});