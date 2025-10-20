# 🌊 ECO HEROES: VIETNAM ENVIRONMENTAL CHALLENGE

## 🎮 Game Overview

**Eco Heroes** is an educational web-based game addressing critical environmental and social challenges in Vietnam. Through three progressive levels, players experience and learn about ocean pollution, urban flooding, and disaster relief response - all issues that significantly impact Vietnamese communities.

### 🌍 Social Impact Theme

This game focuses on **Climate Change & Environmental Sustainability** in Vietnam, specifically:
- **Ocean Plastic Pollution** in the South China Sea
- **Urban Flooding** caused by waste-blocked drainage systems in Hanoi
- **Disaster Preparedness & Relief** for flood-affected communities

---

## 🎯 Game Requirements Met

✅ **Multiple Screens**: Menu, Level Selection, 3 Playable Levels, End Screens  
✅ **2D Graphics**: Canvas-based pixel art and sprite graphics  
✅ **HTML/CSS/JavaScript Only**: No backend required, runs entirely in browser  
✅ **Educational Content**: Real statistics and facts about Vietnam's environmental challenges  
✅ **Engaging Gameplay**: Progressive difficulty, single/multiplayer modes, time-based challenges  

---

## 📋 Game Levels

### Level 1: Ocean Cleanup - South China Sea 🌊
**Theme**: Marine plastic pollution and ecosystem protection  
**Gameplay**: Control a boat with a mechanical grabber to collect floating plastic waste while protecting fish and marine life  
**Learning Objectives**:
- Vietnam discharges 730,000+ tons of plastic into oceans annually
- Microplastics enter the food chain, affecting human health
- Community cleanup efforts can make measurable impact

**Game Modes**:
- **Single Player**: Race against time to collect 100 points
- **Multiplayer**: Compete with a friend (2 players, 1 keyboard)

**Controls**: 
- Player 1: `A/D` or `←/→` to move, `SPACE` to launch grabber
- Player 2: `←/→` to move, `ENTER` to launch grabber

---

### Level 2: Hanoi Flood Prevention 🌧️
**Theme**: Urban flooding prevention through waste management  
**Gameplay**: Clear plastic waste from sewer drains before heavy rain floods the city streets  
**Learning Objectives**:
- 80% of Hanoi's urban flooding is caused by blocked drainage
- Hanoi's colonial-era sewer system struggles with modern waste volumes
- Community action can prevent displacement of thousands of families

**Challenge**: Players have limited time before rain starts. Water level rises when sewers are blocked and drains when sewers are clear.

**Controls**: `A/D` or `←/→` to move character, `SPACE` to pick up/drop trash

---

### Level 3: Disaster Relief Drone 🚁
**Theme**: Emergency humanitarian response in flood disasters  
**Gameplay**: Pilot a drone to deliver medical supplies, food, and water to families stranded by flooding  
**Learning Objectives**:
- Super Typhoon Yagi (2024) affected 200,000+ people in Northern Vietnam
- The "Golden 72 Hours" after disaster are critical for saving lives
- Modern drone technology is revolutionizing disaster response

**Challenge**: Manage drone battery while making multiple supply runs. Each family needs all three supply types.

**Controls**: `WASD` or `↑←↓→` to fly drone, `SPACE` to pick up/drop supplies

---

## 🛠️ Technology Stack

### Core Technologies
- **HTML5**: Semantic structure and Canvas API for rendering
- **CSS3**: Responsive design, gradients, animations, flexbox layouts
- **JavaScript (ES6+)**: Game logic, collision detection, state management

### Game Features
- **Canvas 2D Rendering**: Custom drawing functions for sprites and backgrounds
- **Collision Detection**: Bounding box algorithms for gameplay interactions
- **State Management**: Game state tracking across levels and modes
- **Audio Integration**: Background music and sound effects (HTML5 Audio API)
- **Responsive Design**: Mobile-friendly layouts and touch controls
- **Asset Management**: Dynamic image and audio loading

### Libraries/Frameworks
- **No external frameworks** - Pure vanilla JavaScript for maximum compatibility
- Runs entirely client-side without server requirements

---

## 🤖 AI Tools Used

### 1. **Code Generation & Debugging**
- **GitHub Copilot**: Primary coding assistant for game logic, collision detection, and state management
- **ChatGPT (GPT-4)**: Architecture planning, algorithm optimization, debugging complex issues

### 2. **Asset Generation**
- **DALL-E 3 / Midjourney**: Initial concept art for game sprites (boat, fish, drone, city assets)
- **Pixlr AI**: Sprite refinement and pixel art optimization
- **Canva AI**: UI element design and layout planning

### 3. **Content Creation**
- **ChatGPT**: Educational fact-checking, statistics verification, narrative writing
- **Gemini**: Research on Vietnam's environmental challenges and disaster statistics

### 4. **Audio**
- **ElevenLabs / Soundraw**: Background music generation (ocean ambience, rain sounds)
- **Freesound.org**: Sound effect sourcing (public domain)

### 5. **Testing & Refinement**
- **GitHub Copilot Chat**: Code review and optimization suggestions
- **ChatGPT**: User experience feedback and gameplay balancing recommendations

---

## 🚀 How to Run the Game

### Option 1: Direct File Opening
1. Download/clone this repository
2. Navigate to the `game_app` folder
3. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
4. Start playing!

### Option 2: Local Web Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Then open: http://localhost:8000
```

### Browser Requirements
- Modern browser with Canvas API support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Audio support for sound effects and music

---

## 🎓 Educational Impact

### Target Audience
- Students (ages 12+) learning about environmental issues
- Educators teaching climate change and sustainability
- General public interested in Vietnam's environmental challenges

### Learning Outcomes
Players will understand:
1. **The scale of ocean plastic pollution** affecting Vietnam's 3,200+ km coastline
2. **Urban infrastructure challenges** in rapidly developing cities like Hanoi
3. **Disaster response logistics** and the importance of preparation
4. **Individual and community action** can create measurable environmental impact

### Real-World Context
All game statistics are based on real data from:
- Vietnam Environment Administration (2024)
- World Bank Vietnam Reports
- Hanoi Department of Natural Resources & Environment
- Typhoon Yagi Impact Studies (September 2024)

---

## 🌟 Potential Impact

### Awareness Building
- Highlights Vietnam-specific environmental challenges to local and international audiences
- Uses engaging gameplay to make serious issues accessible and memorable

### Behavior Change
- Demonstrates consequences of plastic pollution through interactive gameplay
- Shows how individual actions (proper waste disposal) prevent larger disasters
- Illustrates importance of disaster preparedness

### Educational Applications
- Can be used in schools to teach environmental science
- Provides cultural context specific to Vietnam and Southeast Asia
- Gamifies complex issues to increase student engagement

---

## 📊 Game Mechanics Summary

### Scoring System
- **Level 1**: Points based on trash type (bottles: 10pts, plastic bags: 15pts, large debris: 20pts)
- **Level 2**: Binary success (prevent flooding) or failure (city floods)
- **Level 3**: Delivery-based progression (3 supplies × 5 families = 15 total deliveries)

### Difficulty Progression
- **Level 1**: Time pressure + collision penalties
- **Level 2**: Time pressure + resource management (water level)
- **Level 3**: Time + battery management + multiple delivery objectives

### Replay Value
- Two game modes (single/multiplayer)
- Progressive difficulty encourages mastery
- Educational facts change based on performance

---

## 🎨 Visual Design

### Art Style
- **Pixel Art Aesthetic**: Nostalgic, accessible, works on all devices
- **Color Palette**: Blues and greens for ocean, grays for urban environments, warm tones for UI
- **Animations**: Smooth canvas-based movement, particle effects for engagement

### UI/UX Principles
- Clear visual hierarchy with contrasting colors
- Real-time feedback (score updates, visual indicators)
- Consistent iconography across levels
- Accessibility considerations (readable fonts, color contrast)

---

## 🐛 Known Issues & Future Improvements

### Current Limitations
- Mobile touch controls work but keyboard is optimal experience
- Audio may require user interaction to start (browser autoplay policies)
- Asset loading delay on slow connections

### Planned Features
- Additional levels (waste recycling facility, coastal cleanup)
- Leaderboard system (local storage)
- Social sharing features
- Multiple language support (Vietnamese translation)
- Expanded educational content library

---

## 📜 Credits & Acknowledgments

### Development
- **Game Design & Programming**: Created using AI-assisted development (GitHub Copilot, ChatGPT)
- **Educational Content**: Research based on official Vietnamese government and NGO reports

### Data Sources
- Vietnam Environment Administration
- World Bank Vietnam
- Hanoi Department of Natural Resources & Environment
- Ocean Conservancy Vietnam Reports
- Typhoon Yagi Impact Studies (2024)

### Inspiration
- Vietnamese environmental activists and organizations
- Communities affected by Typhoon Yagi (September 2024)
- Global movements for ocean cleanup and climate action

---

## 📧 Contact & Contribution

This game is designed for educational purposes and raising awareness about environmental challenges in Vietnam.

### For Educators
Feel free to use this game in classroom settings. We welcome feedback on educational effectiveness.

### For Developers
Contributions welcome! Areas for improvement:
- Additional levels focused on other environmental issues
- Accessibility enhancements
- Performance optimizations
- Localization (Vietnamese, other languages)

---

## 📄 License

This project is created for educational purposes as part of a hackathon submission.

**Assets**: Original assets generated using AI tools and public domain resources  
**Code**: Available for educational and non-commercial use  
**Data**: Environmental statistics cited from public sources  

---

## 🌏 Final Message

Climate change and environmental degradation affect communities worldwide, but the impacts are felt most acutely by vulnerable populations in developing nations like Vietnam. This game aims to:

1. **Educate** players about real environmental challenges
2. **Inspire** action through engaging gameplay
3. **Demonstrate** that individual and community efforts matter

Every piece of plastic removed, every sewer kept clear, and every family helped in the game represents real-world actions that can make a difference.

**Play to learn. Learn to act. Act to create change.**

---

*Developed with ❤️ for a sustainable future in Vietnam and beyond.*
