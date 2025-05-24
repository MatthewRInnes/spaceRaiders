import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Trophy, Star } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  speed: number;
  health: number;
  type: 'basic' | 'fast' | 'tank' | 'boss';
  maxHealth: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'health' | 'rapidFire' | 'shield';
}

interface LevelConfig {
  enemySpawnRate: number;
  enemySpeed: number;
  bossLevel: boolean;
  enemyTypes: Enemy['type'][];
  requiredScore: number;
}

const SpaceRaiders = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotTimeRef = useRef<number>(0);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true);
  
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => 
    parseInt(localStorage.getItem('spaceRaidersHighScore') || '0')
  );
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  
  // Player state
  const [playerPos, setPlayerPos] = useState<Position>({ x: 400, y: 500 });
  const [playerHealth, setPlayerHealth] = useState(100);
  const [shield, setShield] = useState(false);
  const [rapidFire, setRapidFire] = useState(false);
  
  // Game objects
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  // Game constants
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 8;
  const SHOT_COOLDOWN = rapidFire ? 100 : 200; // Milliseconds between shots

  // Level configurations
  const levelConfigs: LevelConfig[] = [
    { enemySpawnRate: 0.02, enemySpeed: 1, bossLevel: false, enemyTypes: ['basic'], requiredScore: 500 },
    { enemySpawnRate: 0.025, enemySpeed: 1.2, bossLevel: false, enemyTypes: ['basic', 'fast'], requiredScore: 1200 },
    { enemySpawnRate: 0.03, enemySpeed: 1.4, bossLevel: false, enemyTypes: ['basic', 'fast', 'tank'], requiredScore: 2000 },
    { enemySpawnRate: 0.02, enemySpeed: 1.8, bossLevel: true, enemyTypes: ['basic', 'fast', 'tank', 'boss'], requiredScore: 3000 },
    { enemySpawnRate: 0.035, enemySpeed: 2, bossLevel: false, enemyTypes: ['fast', 'tank'], requiredScore: 4500 },
    { enemySpawnRate: 0.04, enemySpeed: 2.2, bossLevel: false, enemyTypes: ['basic', 'fast', 'tank'], requiredScore: 6000 },
    { enemySpawnRate: 0.025, enemySpeed: 2.5, bossLevel: true, enemyTypes: ['fast', 'tank', 'boss'], requiredScore: 8000 },
  ];

  const getCurrentLevelConfig = (): LevelConfig => {
    return levelConfigs[Math.min(level - 1, levelConfigs.length - 1)] || levelConfigs[levelConfigs.length - 1];
  };

  // Enhanced shoot bullet function - MOVED BEFORE useEffect
  const shootBullet = useCallback(() => {
    const now = Date.now();
    const cooldown = rapidFire ? 100 : 200;
    
    if (now - lastShotTimeRef.current < cooldown) {
      return; // Still in cooldown
    }
    
    lastShotTimeRef.current = now;
    
    setBullets(prev => [...prev, {
      id: now + Math.random(), // Ensure unique ID
      x: playerPos.x + 28, // Center of spaceship (60px width / 2 - 2px bullet width)
      y: playerPos.y - 10, // Start slightly above the spaceship
      speed: BULLET_SPEED
    }]);
    
    console.log('Bullet fired at position:', { x: playerPos.x + 28, y: playerPos.y - 10 });
  }, [playerPos, rapidFire]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      if ((e.code === 'Space' || e.code === 'KeyJ') && gameState === 'playing') {
        e.preventDefault();
        shootBullet();
      }
      if (e.code === 'Escape') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, shootBullet]);

  // Enhanced spaceship graphics
  const PlayerShip = ({ x, y, shield }: { x: number; y: number; shield: boolean }) => (
    <div
      className={`absolute transition-all duration-75 ${shield ? `ring-4 ${darkMode ? 'ring-cyan-400' : 'ring-yellow-400'} ring-opacity-60` : ''}`}
      style={{
        left: x,
        top: y,
        width: '60px',
        height: '60px',
        filter: darkMode ? 'drop-shadow(0 0 20px #00ffff)' : 'drop-shadow(0 0 15px #8b5cf6)'
      }}
    >
      <svg viewBox="0 0 60 60" className="w-full h-full">
        <defs>
          <linearGradient id="playerShipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={darkMode ? "#00ffff" : "#8b5cf6"} />
            <stop offset="50%" stopColor={darkMode ? "#0099ff" : "#a855f7"} />
            <stop offset="100%" stopColor={darkMode ? "#0066cc" : "#7c3aed"} />
          </linearGradient>
          <linearGradient id="engineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={darkMode ? "#ff6600" : "#f97316"} />
            <stop offset="100%" stopColor={darkMode ? "#ff0066" : "#ec4899"} />
          </linearGradient>
        </defs>
        {/* Main ship body */}
        <path d="M30 5 L20 45 L30 40 L40 45 Z" fill="url(#playerShipGradient)" stroke={darkMode ? "#00ffff" : "#8b5cf6"} strokeWidth="2"/>
        {/* Wings */}
        <path d="M15 35 L5 45 L15 40 Z" fill="url(#playerShipGradient)" stroke={darkMode ? "#00ffff" : "#8b5cf6"} strokeWidth="1"/>
        <path d="M45 35 L55 45 L45 40 Z" fill="url(#playerShipGradient)" stroke={darkMode ? "#00ffff" : "#8b5cf6"} strokeWidth="1"/>
        {/* Cockpit */}
        <ellipse cx="30" cy="20" rx="8" ry="12" fill={darkMode ? "#0088ff" : "#6366f1"} stroke={darkMode ? "#00ffff" : "#8b5cf6"} strokeWidth="1"/>
        <ellipse cx="30" cy="18" rx="4" ry="6" fill={darkMode ? "#ff00ff" : "#ec4899"} opacity="0.8"/>
        {/* Engine glow */}
        <ellipse cx="30" cy="50" rx="8" ry="15" fill="url(#engineGlow)" opacity="0.8"/>
        <ellipse cx="25" cy="48" rx="3" ry="8" fill="url(#engineGlow)" opacity="0.6"/>
        <ellipse cx="35" cy="48" rx="3" ry="8" fill="url(#engineGlow)" opacity="0.6"/>
      </svg>
    </div>
  );

  // Enhanced enemy graphics
  const EnemyShip = ({ enemy }: { enemy: Enemy }) => (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: enemy.x,
        top: enemy.y,
        width: enemy.type === 'boss' ? '80px' : enemy.type === 'tank' ? '60px' : '50px',
        height: enemy.type === 'boss' ? '80px' : enemy.type === 'tank' ? '60px' : '50px',
        filter: `drop-shadow(0 0 15px ${
          enemy.type === 'boss' ? (darkMode ? '#ff0066' : '#ef4444') :
          enemy.type === 'basic' ? (darkMode ? '#ff0066' : '#ef4444') :
          enemy.type === 'fast' ? (darkMode ? '#ff8800' : '#f97316') :
          (darkMode ? '#8800ff' : '#8b5cf6')
        })`
      }}
    >
      <svg viewBox="0 0 60 60" className="w-full h-full">
        <defs>
          <linearGradient id={`enemyGradient${enemy.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={
              enemy.type === 'boss' ? (darkMode ? '#ff0066' : '#ef4444') :
              enemy.type === 'basic' ? (darkMode ? '#ff0066' : '#ef4444') :
              enemy.type === 'fast' ? (darkMode ? '#ff8800' : '#f97316') :
              (darkMode ? '#8800ff' : '#8b5cf6')
            } />
            <stop offset="100%" stopColor={
              enemy.type === 'boss' ? (darkMode ? '#cc0044' : '#dc2626') :
              enemy.type === 'basic' ? (darkMode ? '#cc0044' : '#dc2626') :
              enemy.type === 'fast' ? (darkMode ? '#cc6600' : '#ea580c') :
              (darkMode ? '#6600cc' : '#7c3aed')
            } />
          </linearGradient>
        </defs>
        
        {enemy.type === 'boss' ? (
          <>
            {/* Boss ship - large and intimidating */}
            <rect x="10" y="15" width="40" height="30" rx="8" fill={`url(#enemyGradient${enemy.id})`} stroke={darkMode ? '#ff00ff' : '#ec4899'} strokeWidth="3"/>
            <circle cx="20" cy="25" r="6" fill={darkMode ? '#ff00ff' : '#ec4899'} />
            <circle cx="40" cy="25" r="6" fill={darkMode ? '#ff00ff' : '#ec4899'} />
            <circle cx="30" cy="35" r="8" fill={darkMode ? '#ff0066' : '#ef4444'} />
            {/* Health bar for boss */}
            <rect x="5" y="5" width="50" height="4" fill="rgba(0,0,0,0.5)" rx="2"/>
            <rect x="5" y="5" width={50 * (enemy.health / enemy.maxHealth)} height="4" fill={darkMode ? '#ff0066' : '#ef4444'} rx="2"/>
          </>
        ) : enemy.type === 'tank' ? (
          <>
            {/* Tank enemy - rectangular and sturdy */}
            <rect x="8" y="15" width="44" height="25" rx="6" fill={`url(#enemyGradient${enemy.id})`} stroke={darkMode ? '#ff00ff' : '#ec4899'} strokeWidth="2"/>
            <rect x="15" y="10" width="30" height="8" rx="4" fill={`url(#enemyGradient${enemy.id})`} />
            <circle cx="20" cy="27" r="4" fill={darkMode ? '#ff00ff' : '#ec4899'} />
            <circle cx="40" cy="27" r="4" fill={darkMode ? '#ff00ff' : '#ec4899'} />
          </>
        ) : enemy.type === 'fast' ? (
          <>
            {/* Fast enemy - sleek and angular */}
            <path d="M30 10 L45 30 L35 45 L25 45 L15 30 Z" fill={`url(#enemyGradient${enemy.id})`} stroke={darkMode ? '#ff00ff' : '#ec4899'} strokeWidth="2"/>
            <path d="M25 20 L35 20 L30 35 Z" fill={darkMode ? '#ff8800' : '#f97316'} />
            <circle cx="30" cy="25" r="3" fill={darkMode ? '#ff00ff' : '#ec4899'} />
          </>
        ) : (
          <>
            {/* Basic enemy - classic invader shape */}
            <path d="M30 45 L15 15 L30 10 L45 15 Z" fill={`url(#enemyGradient${enemy.id})`} stroke={darkMode ? '#ff00ff' : '#ec4899'} strokeWidth="2"/>
            <circle cx="25" cy="25" r="3" fill={darkMode ? '#ff00ff' : '#ec4899'} />
            <circle cx="35" cy="25" r="3" fill={darkMode ? '#ff00ff' : '#ec4899'} />
            <path d="M20 35 L40 35 L30 30 Z" fill={darkMode ? '#ff0066' : '#ef4444'} />
          </>
        )}
      </svg>
    </div>
  );

  // Enhanced spawn enemy with level-based logic
  const spawnEnemy = useCallback(() => {
    const levelConfig = getCurrentLevelConfig();
    const type = levelConfig.enemyTypes[Math.floor(Math.random() * levelConfig.enemyTypes.length)];
    
    let health = 1;
    let speed = levelConfig.enemySpeed;
    
    switch (type) {
      case 'fast':
        health = 1;
        speed = levelConfig.enemySpeed * 1.8;
        break;
      case 'tank':
        health = 3;
        speed = levelConfig.enemySpeed * 0.7;
        break;
      case 'boss':
        health = 15;
        speed = levelConfig.enemySpeed * 0.5;
        break;
      default:
        health = 1;
    }
    
    const enemy: Enemy = {
      id: Date.now(),
      x: Math.random() * (GAME_WIDTH - (type === 'boss' ? 80 : type === 'tank' ? 60 : 50)),
      y: -50,
      speed,
      health,
      maxHealth: health,
      type
    };
    
    setEnemies(prev => [...prev, enemy]);
  }, [level]);

  // Spawn power-up
  const spawnPowerUp = useCallback(() => {
    if (Math.random() < 0.15) { // 15% chance
      const types: PowerUp['type'][] = ['health', 'rapidFire', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      setPowerUps(prev => [...prev, {
        id: Date.now(),
        x: Math.random() * (GAME_WIDTH - 40),
        y: -40,
        type
      }]);
    }
  }, []);

  // Check collisions
  const checkCollisions = useCallback(() => {
    // Bullet-enemy collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      
      setEnemies(prevEnemies => {
        const remainingEnemies = [...prevEnemies];
        
        prevBullets.forEach(bullet => {
          prevEnemies.forEach((enemy, enemyIndex) => {
            const enemySize = enemy.type === 'boss' ? 40 : enemy.type === 'tank' ? 30 : 25;
            const dx = bullet.x - (enemy.x + enemySize);
            const dy = bullet.y - (enemy.y + enemySize);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemySize) {
              // Hit!
              const bulletIndex = remainingBullets.findIndex(b => b.id === bullet.id);
              if (bulletIndex > -1) {
                remainingBullets.splice(bulletIndex, 1);
              }
              
              enemy.health--;
              if (enemy.health <= 0) {
                remainingEnemies.splice(enemyIndex, 1);
                const points = enemy.type === 'boss' ? 100 : enemy.type === 'tank' ? 30 : enemy.type === 'fast' ? 20 : 10;
                setScore(prev => prev + points);
                setEnemiesKilled(prev => prev + 1);
                
                // Random power-up drop (higher chance for stronger enemies)
                const dropChance = enemy.type === 'boss' ? 0.8 : enemy.type === 'tank' ? 0.4 : 0.2;
                if (Math.random() < dropChance) {
                  spawnPowerUp();
                }
              }
            }
          });
        });
        
        return remainingEnemies;
      });
      
      return remainingBullets;
    });

    // Player-enemy collisions
    setEnemies(prevEnemies => {
      return prevEnemies.filter(enemy => {
        const enemySize = enemy.type === 'boss' ? 40 : enemy.type === 'tank' ? 30 : 25;
        const dx = (playerPos.x + 30) - (enemy.x + enemySize);
        const dy = (playerPos.y + 30) - (enemy.y + enemySize);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (enemySize + 20)) {
          if (!shield) {
            const damage = enemy.type === 'boss' ? 40 : enemy.type === 'tank' ? 25 : 20;
            setPlayerHealth(prev => Math.max(0, prev - damage));
          } else {
            setShield(false);
          }
          return false; // Remove enemy
        }
        return true;
      });
    });

    // Player-powerup collisions
    setPowerUps(prevPowerUps => {
      return prevPowerUps.filter(powerUp => {
        const dx = (playerPos.x + 30) - (powerUp.x + 20);
        const dy = (playerPos.y + 30) - (powerUp.y + 20);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 35) {
          // Apply power-up effect
          switch (powerUp.type) {
            case 'health':
              setPlayerHealth(prev => Math.min(100, prev + 40));
              break;
            case 'rapidFire':
              setRapidFire(true);
              setTimeout(() => setRapidFire(false), 8000);
              break;
            case 'shield':
              setShield(true);
              setTimeout(() => setShield(false), 10000);
              break;
          }
          return false; // Remove power-up
        }
        return true;
      });
    });
  }, [playerPos, shield, spawnPowerUp]);

  // Check level progression
  const checkLevelProgression = useCallback(() => {
    const levelConfig = getCurrentLevelConfig();
    if (score >= levelConfig.requiredScore && enemies.length === 0) {
      if (level < levelConfigs.length) {
        setGameState('levelComplete');
        setTimeout(() => {
          setLevel(prev => prev + 1);
          setGameState('playing');
          setPlayerHealth(100);
          setBullets([]);
          setPowerUps([]);
        }, 3000);
      }
    }
  }, [score, level, enemies.length]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Move player
    setPlayerPos(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('KeyA')) {
        newX = Math.max(0, prev.x - PLAYER_SPEED);
      }
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('KeyD')) {
        newX = Math.min(GAME_WIDTH - 60, prev.x + PLAYER_SPEED);
      }
      if (keysRef.current.has('ArrowUp') || keysRef.current.has('KeyW')) {
        newY = Math.max(0, prev.y - PLAYER_SPEED);
      }
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('KeyS')) {
        newY = Math.min(GAME_HEIGHT - 60, prev.y + PLAYER_SPEED);
      }

      return { x: newX, y: newY };
    });

    // Continuous shooting with rapid fire
    if (rapidFire && keysRef.current.has('Space')) {
      shootBullet();
    }

    // Move bullets
    setBullets(prev => {
      const newBullets = prev
        .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
        .filter(bullet => bullet.y > -20);
      
      console.log('Current bullets count:', newBullets.length);
      return newBullets;
    });

    // Move enemies
    setEnemies(prev => prev
      .map(enemy => ({ ...enemy, y: enemy.y + enemy.speed }))
      .filter(enemy => enemy.y < GAME_HEIGHT + 100)
    );

    // Move power-ups
    setPowerUps(prev => prev
      .map(powerUp => ({ ...powerUp, y: powerUp.y + 2 }))
      .filter(powerUp => powerUp.y < GAME_HEIGHT + 40)
    );

    // Spawn enemies based on level configuration
    const levelConfig = getCurrentLevelConfig();
    if (Math.random() < levelConfig.enemySpawnRate) {
      spawnEnemy();
    }

    // Check collisions
    checkCollisions();

    // Check level progression
    checkLevelProgression();

    // Check game over
    if (playerHealth <= 0) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('spaceRaidersHighScore', score.toString());
          }
        } else {
          setPlayerHealth(100);
          setPlayerPos({ x: 400, y: 500 });
        }
        return newLives;
      });
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, playerPos, level, score, highScore, playerHealth, lives, shield, rapidFire, enemies.length, shootBullet, spawnEnemy, checkCollisions, checkLevelProgression]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setPlayerHealth(100);
    setPlayerPos({ x: 400, y: 500 });
    setBullets([]);
    setEnemies([]);
    setPowerUps([]);
    setShield(false);
    setRapidFire(false);
    setEnemiesKilled(0);
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const resetGame = () => {
    setGameState('menu');
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameState('playing');
    setPlayerHealth(100);
    setBullets([]);
    setPowerUps([]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-b from-gray-900 via-purple-900 to-black' : 'bg-gradient-to-b from-blue-100 via-purple-100 to-indigo-200'} flex items-center justify-center p-4`}>
      <div className="relative">
        {/* Theme Toggle */}
        <div className="absolute -top-16 right-0 flex items-center gap-2 text-white">
          <Sun className="w-4 h-4" />
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="data-[state=checked]:bg-cyan-500"
          />
          <Moon className="w-4 h-4" />
        </div>

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className={`relative border-2 ${darkMode ? 'border-cyan-400' : 'border-purple-400'} rounded-lg overflow-hidden shadow-2xl`}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Animated Background */}
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black' : 'bg-gradient-to-b from-blue-200 via-purple-200 to-indigo-300'}`}>
            <div className="stars-bg absolute inset-0"></div>
          </div>

          {/* Game Objects */}
          {gameState === 'playing' && (
            <>
              {/* Player Ship */}
              <PlayerShip x={playerPos.x} y={playerPos.y} shield={shield} />

              {/* Bullets - Enhanced with better visibility */}
              {bullets.map(bullet => (
                <div
                  key={bullet.id}
                  className={`absolute w-4 h-12 rounded-full ${darkMode ? 'bg-gradient-to-t from-cyan-300 to-cyan-500' : 'bg-gradient-to-t from-purple-400 to-purple-600'}`}
                  style={{
                    left: bullet.x - 2, // Center the bullet (4px width / 2)
                    top: bullet.y,
                    filter: darkMode ? 'drop-shadow(0 0 12px #00ffff)' : 'drop-shadow(0 0 8px #8b5cf6)',
                    boxShadow: darkMode ? '0 0 15px #00ffff' : '0 0 10px #8b5cf6',
                    zIndex: 10
                  }}
                />
              ))}

              {/* Enemies */}
              {enemies.map(enemy => (
                <EnemyShip key={enemy.id} enemy={enemy} />
              ))}

              {/* Power-ups - Enhanced */}
              {powerUps.map(powerUp => (
                <div
                  key={powerUp.id}
                  className={`absolute w-12 h-12 rounded-full animate-pulse border-3 ${
                    powerUp.type === 'health' ? (darkMode ? 'bg-green-400 border-green-300' : 'bg-green-500 border-green-400') :
                    powerUp.type === 'rapidFire' ? (darkMode ? 'bg-yellow-400 border-yellow-300' : 'bg-yellow-500 border-yellow-400') :
                    (darkMode ? 'bg-blue-400 border-blue-300' : 'bg-blue-500 border-blue-400')
                  }`}
                  style={{
                    left: powerUp.x,
                    top: powerUp.y,
                    filter: `drop-shadow(0 0 20px ${
                      powerUp.type === 'health' ? '#00ff00' :
                      powerUp.type === 'rapidFire' ? '#ffff00' :
                      '#0088ff'
                    })`,
                    boxShadow: `0 0 25px ${
                      powerUp.type === 'health' ? '#00ff00' :
                      powerUp.type === 'rapidFire' ? '#ffff00' :
                      '#0088ff'
                    }`
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {powerUp.type === 'health' ? '+' : powerUp.type === 'rapidFire' ? '⚡' : '🛡'}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Enhanced UI Overlay with Better Scoreboard */}
          {gameState === 'playing' && (
            <div className={`absolute top-4 left-4 right-4 flex justify-between items-start ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {/* Enhanced Scoreboard */}
              <div className={`${darkMode ? 'bg-black/70' : 'bg-white/80'} p-4 rounded-lg border ${darkMode ? 'border-cyan-400' : 'border-purple-400'} backdrop-blur-sm`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className={`text-lg font-bold ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
                      {score.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>Level {level}</span>
                    </div>
                    <div>Lives: {lives}</div>
                    <div>Killed: {enemiesKilled}</div>
                  </div>
                  <div className="text-xs opacity-75">
                    Next: {getCurrentLevelConfig().requiredScore.toLocaleString()}
                  </div>
                  <div className={`w-40 h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden border-2 ${darkMode ? 'border-cyan-400' : 'border-purple-400'}`}>
                    <div 
                      className={`h-full ${darkMode ? 'bg-gradient-to-r from-green-400 to-cyan-400' : 'bg-gradient-to-r from-green-500 to-blue-500'} transition-all duration-300`}
                      style={{ width: `${playerHealth}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Status Effects and Controls */}
              <div className="space-y-2 text-right">
                {rapidFire && (
                  <div className={`${darkMode ? 'bg-yellow-900/70 text-yellow-400' : 'bg-orange-100 text-orange-600'} px-3 py-1 rounded-full text-sm font-bold animate-pulse backdrop-blur-sm`}>
                    ⚡ RAPID FIRE!
                  </div>
                )}
                {shield && (
                  <div className={`${darkMode ? 'bg-blue-900/70 text-blue-400' : 'bg-blue-100 text-blue-600'} px-3 py-1 rounded-full text-sm font-bold animate-pulse backdrop-blur-sm`}>
                    🛡 SHIELD ACTIVE
                  </div>
                )}
                <div className="text-xs opacity-75 space-y-1">
                  <div>ESC: Pause</div>
                  <div>SPACE: Shoot</div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Screen */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <Card className={`p-8 text-center ${darkMode ? 'bg-gray-900 border-cyan-400' : 'bg-white border-purple-400'}`}>
                <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-cyan-400' : 'text-purple-600'} animate-pulse`}>SPACE RAIDERS</h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Defend Earth from alien invaders across multiple levels!</p>
                <div className="space-y-4">
                  <Button onClick={startGame} size="lg" className={`w-full ${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
                    START GAME
                  </Button>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Score:</span>
                      <span className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>
                        {highScore.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs opacity-75">
                      {levelConfigs.length} challenging levels await!
                    </div>
                  </div>
                </div>
                <div className={`mt-6 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} space-y-1`}>
                  <div>WASD or Arrow Keys: Move</div>
                  <div>SPACE: Shoot</div>
                  <div>ESC: Pause</div>
                </div>
              </Card>
            </div>
          )}

          {/* Level Complete Screen */}
          {gameState === 'levelComplete' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <Card className={`p-8 text-center ${darkMode ? 'bg-gray-900 border-green-400' : 'bg-white border-green-500'}`}>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>LEVEL COMPLETE!</h2>
                <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div>Level {level} Cleared!</div>
                  <div>Score: {score.toLocaleString()}</div>
                  <div>Enemies Defeated: {enemiesKilled}</div>
                </div>
                <div className={`${darkMode ? 'text-cyan-400' : 'text-purple-600'} text-lg font-bold`}>
                  Preparing Level {level + 1}...
                </div>
              </Card>
            </div>
          )}

          {/* Pause Screen */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <Card className={`p-6 text-center ${darkMode ? 'bg-gray-900 border-cyan-400' : 'bg-white border-purple-400'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}>PAUSED</h2>
                <div className="space-y-3">
                  <Button onClick={togglePause} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    RESUME
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="w-full">
                    MAIN MENU
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
              <Card className={`p-8 text-center ${darkMode ? 'bg-gray-900 border-red-400' : 'bg-white border-red-500'}`}>
                <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>GAME OVER</h2>
                <div className={`space-y-2 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold">Final Score: {score.toLocaleString()}</span>
                  </div>
                  <div>Level Reached: {level}</div>
                  <div>Total Enemies Defeated: {enemiesKilled}</div>
                  {score > highScore && (
                    <div className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-bold animate-pulse text-lg`}>
                      🏆 NEW HIGH SCORE! 🏆
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <Button onClick={startGame} className={`w-full ${darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}>
                    PLAY AGAIN
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="w-full">
                    MAIN MENU
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto md:hidden">
          <Button
            onTouchStart={() => keysRef.current.add('ArrowLeft')}
            onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
            variant="outline"
            size="sm"
            className={darkMode ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black' : 'border-purple-400 text-purple-600 hover:bg-purple-400 hover:text-white'}
          >
            ←
          </Button>
          <Button
            onTouchStart={() => shootBullet()}
            variant="outline"
            size="sm"
            className={darkMode ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black' : 'border-purple-400 text-purple-600 hover:bg-purple-400 hover:text-white'}
          >
            🚀
          </Button>
          <Button
            onTouchStart={() => keysRef.current.add('ArrowRight')}
            onTouchEnd={() => keysRef.current.delete('ArrowRight')}
            variant="outline"
            size="sm"
            className={darkMode ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black' : 'border-purple-400 text-purple-600 hover:bg-purple-400 hover:text-white'}
          >
            →
          </Button>
        </div>
      </div>

      <style>{`
        .stars-bg {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, ${darkMode ? '#fff' : '#8b5cf6'}, transparent),
            radial-gradient(2px 2px at 40px 70px, ${darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(139,92,246,0.8)'}, transparent),
            radial-gradient(1px 1px at 90px 40px, ${darkMode ? '#fff' : '#8b5cf6'}, transparent),
            radial-gradient(1px 1px at 130px 80px, ${darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(139,92,246,0.6)'}, transparent),
            radial-gradient(2px 2px at 160px 30px, ${darkMode ? '#fff' : '#8b5cf6'}, transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: twinkle 3s ease-in-out infinite alternate;
        }
        
        @keyframes twinkle {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SpaceRaiders;
