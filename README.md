Cosmic Raider Blasters

Project Structure

Configuration Files

package.json
Basic Information: Contains project metadata and configuration
Scripts:
dev: Starts the development server
build: Creates a production build
build:dev: Creates a development build
![spaceraidersHome](https://github.com/user-attachments/assets/af33fd29-8d07-4690-bd57-436e9f18347d)

lint: Runs the linter
preview: Previews the production build
Dependencies: Lists all production and development dependencies

vite.config.ts
Server Configuration: Sets up the development server on port 8080
Plugins: Configures React with SWC compiler
Module Resolution: Sets up path aliases for cleaner imports

Source Files
![spaceRaidersGameover](https://github.com/user-attachments/assets/1179159e-3b7f-4f04-ae9e-2f61dab57367)

index.html
Meta Tags: Contains essential meta information for SEO and social sharing
Open Graph Tags: Configures how the site appears when shared on social media
Twitter Cards: Configures how the site appears when shared on Twitter
Scripts: Loads the main application and required dependencies

Development

To start development:
Install dependencies: npm install
Start the development server: npm run dev
Build for production: npm run build

Technologies Used
React with TypeScript
Vite for build tooling
Tailwind CSS for styling
Various UI components from Radix UI

Space Raiders - Arcade Space Shooter Game

Welcome to Space Raiders, an exciting arcade-style space shooter game where you defend Earth from waves of alien invaders! Take control of your spaceship and battle through multiple challenging levels.

How to Play

Starting the Game
Click START GAME from the main menu to begin your mission
Your spaceship appears at the bottom of the screen
Alien enemies will start attacking from the top

Basic Controls
Arrow Keys or WASD: Move your spaceship around the screen
Spacebar or J Key: Fire bullets at enemies
ESC Key: Pause the game anytime

Mobile Controls (Touch Devices)
Use the on-screen buttons at the bottom:
Left Button: Move left
Rocket Button: Fire bullets
Right Button: Move right

Game Features
![spaceraidersHome](https://github.com/user-attachments/assets/7cb1a581-62c0-4037-9606-0b7062e0125b)

Your Spaceship
Health: You start with 100 health points
Lives: You have 3 lives total
Movement: Move freely around the screen to dodge enemy attacks
Weapons: Fire energy bullets to destroy enemies

Enemy Types
Basic Enemies (Red) - Standard alien ships
Health: 1 hit to destroy
Points: 10 each
Speed: Normal

Fast Enemies (Orange) - Quick and agile
Health: 1 hit to destroy
Points: 20 each
Speed: Very fast

Tank Enemies (Purple) - Heavy armoured ships
Health: 3 hits to destroy
Points: 30 each
Speed: Slow but tough

Boss Enemies (Large Red) - Massive alien warships
Health: 15 hits to destroy
Points: 100 each
Speed: Slow but devastating
Health bar displayed on top

Power-Ups
Destroy enemies to occasionally drop power-ups:

Green Plus: Health Boost
Restores 40 health points
Maximum health is 100

Yellow Lightning: Rapid Fire
Allows continuous shooting for 8 seconds
Much faster bullet rate

Blue Shield: Shield Protection
Protects from one enemy hit for 10 seconds
Glowing blue aura around your ship

Level System
The game features 7 challenging levels:

Level 1: Basic enemies only - Learn the controls
Level 2: Basic and fast enemies appear
Level 3: All enemy types including tanks
Level 4: BOSS LEVEL - Face your first boss battle
Level 5: Faster, more aggressive enemies
Level 6: Maximum difficulty with all enemy types
Level 7: Final boss battle - Ultimate challenge
![spaceRaidersLightmdoe](https://github.com/user-attachments/assets/234350ac-ee84-4ed4-9eb9-caab5e9ea701)

Scoring System
Basic Enemy: 10 points
Fast Enemy: 20 points
Tank Enemy: 30 points
Boss Enemy: 100 points

Each level requires a certain score to advance:
Level 1: 500 points
Level 2: 1,200 points
Level 3: 2,000 points
Level 4: 3,000 points
Level 5: 4,500 points
Level 6: 6,000 points
Level 7: 8,000 points

Game Objectives

How to Win
Survive through all 7 levels
Destroy all enemies in each level
Reach the required score for each level
Defeat the boss enemies in levels 4 and 7

How You Lose
Your health reaches 0 (lose a life)
Lose all 3 lives (game over)
Enemies can damage you by:
Crashing into your spaceship
Each enemy type deals different damage

Visual Features

Theme Options
Dark Mode: Space theme with cyan/blue colours and stars
Light Mode: Bright theme with purple colours
Toggle between themes using the sun/moon switch

Visual Effects
Glowing spaceships with engine trails
Animated star background
Particle effects and explosions
Health bars for boss enemies
Status indicators for active power-ups

Game Interface

Scoreboard (Top Left)
Current Score: Your points in this game
Level: Current level number
Lives: Remaining lives
Enemies Killed: Total enemies destroyed
Next Target: Score needed for next level
Health Bar: Visual health indicator

Status Effects (Top Right)
RAPID FIRE: When rapid fire is active
SHIELD ACTIVE: When shield protection is on
Control hints: Reminder of key controls

Game Screens
Main Menu: Start game and view high score
Level Complete: Shows progress between levels
Pause Screen: Resume or return to menu
Game Over: Final score and play again option

Tips for Success

Keep Moving: Never stay in one place - enemies will hit you
Collect Power-ups: They give you significant advantages
Save Shield for Bosses: Use shield protection during tough boss fights
Learn Enemy Patterns: Each enemy type moves differently
Aim Carefully: Bullets take time to travel, lead your targets
Use Rapid Fire Wisely: Great for clearing multiple enemies quickly
Watch Your Health: Collect health power-ups when low
Practice Movement: Smooth movement helps avoid enemy crashes

Game Experience

Smooth 60fps gameplay
Responsive controls for precise movement
Progressive difficulty that builds skill
Satisfying destruction effects
Achievement system with high scores
Mobile-friendly touch controls

Technical Features

Built with modern web technologies
Runs in any web browser
Automatic save of high scores
Responsive design for all screen sizes
Optimised performance for smooth gameplay

Enjoy defending Earth in Space Raiders! Can you become the ultimate space defender and save humanity from the alien invasion?

Good luck, pilot!
