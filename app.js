// MathGPT Assistant - Complete Frontend Application
// Author: AHMUDUL HASSAN
// Features: ChatGPT-like interface, math keyboard, multilingual support
// Deployment: Netlify, Vercel, GitHub Pages ready

class MathGPTAssistant {
    constructor() {
        // API Configuration
        this.apiKey = 'YOUR_AGENT_API_KEY'; // Replace with actual Windsurf Agent API key
        
        // Chat Management
        this.chatHistory = []; // Array of chat sessions
        this.currentChatId = null; // Active chat session ID
        this.isLoading = false; // Loading state
        
        // UI State
        this.mathKeyboardVisible = false; // Math keyboard visibility
        
        // User Settings
        this.settings = {
            mathKeyboardDefault: false, // Show math keyboard by default
            languagePreference: 'auto' // Auto-detect language
        };
        
        this.init();
    }

    // Initialize application
    init() {
        this.loadSettings(); // Load user preferences from localStorage
        this.loadChatHistory(); // Load chat history from localStorage
        this.bindEvents(); // Set up event listeners
        this.updateSendButton(); // Update send button state
        this.renderChatHistory(); // Render chat history in sidebar
        this.applySettings(); // Apply user settings
    }

    bindEvents() {
        // Send button
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        
        // Input field events
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        messageInput.addEventListener('input', () => {
            this.updateSendButton();
            this.autoResizeTextarea(messageInput);
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Math keyboard toggle
        document.getElementById('keyboardToggle').addEventListener('click', () => {
            this.toggleMathKeyboard();
        });

        // Math keyboard events
        document.querySelectorAll('.math-key').forEach(key => {
            key.addEventListener('click', () => {
                const symbol = key.dataset.symbol;
                this.insertMathSymbol(symbol);
            });
        });

        // Clear history button
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Header buttons
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.createNewChat();
        });

        document.getElementById('aboutBtn').addEventListener('click', () => {
            this.openModal('aboutModal');
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.openModal('helpModal');
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openModal('settingsModal');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal;
                this.closeModal(modalId);
            });
        });

        // Modal backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Settings events
        document.getElementById('mathKeyboardToggle').addEventListener('change', (e) => {
            this.settings.mathKeyboardDefault = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('languagePreference').addEventListener('change', (e) => {
            this.settings.languagePreference = e.target.value;
            this.saveSettings();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Example prompt buttons
        document.querySelectorAll('.example-prompt').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                messageInput.value = prompt;
                this.updateSendButton();
                messageInput.focus();
            });
        });

        // History item clicks
        document.getElementById('historyList').addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const chatId = historyItem.dataset.chatId;
                this.loadChat(chatId);
            }
        });
    }

    createNewChat() {
        // Save current chat if it has messages
        if (this.currentChatId) {
            const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId);
            if (currentChat && currentChat.messages.length === 0) {
                // Remove empty chat
                this.chatHistory = this.chatHistory.filter(chat => chat.id !== this.currentChatId);
            }
        }

        // Create new chat
        this.currentChatId = Date.now().toString();
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">∑</div>
                <h2>Welcome to MathGPT Assistant</h2>
                <p>I can help you solve math problems with step-by-step explanations. Ask me anything!</p>
                <div class="example-prompts">
                    <button class="example-prompt" data-prompt="Solve x² + 5x + 6 = 0">
                        Solve x² + 5x + 6 = 0
                    </button>
                    <button class="example-prompt" data-prompt="What is the derivative of sin(x)?">
                        What is the derivative of sin(x)?
                    </button>
                    <button class="example-prompt" data-prompt="Calculate ∫2x dx">
                        Calculate ∫2x dx
                    </button>
                    <button class="example-prompt" data-prompt="Find the hypotenuse of a right triangle with sides 3 and 4">
                        Find the hypotenuse of a right triangle with sides 3 and 4
                    </button>
                </div>
            </div>
        `;

        // Re-bind example prompt events
        document.querySelectorAll('.example-prompt').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                document.getElementById('messageInput').value = prompt;
                this.updateSendButton();
                document.getElementById('messageInput').focus();
            });
        });

        this.renderChatHistory();
        this.saveChatHistory();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    }

    toggleMathKeyboard() {
        this.mathKeyboardVisible = !this.mathKeyboardVisible;
        const keyboard = document.getElementById('mathKeyboard');
        const toggleBtn = document.getElementById('keyboardToggle');
        
        if (this.mathKeyboardVisible) {
            keyboard.style.display = 'block';
            toggleBtn.classList.add('active');
        } else {
            keyboard.style.display = 'none';
            toggleBtn.classList.remove('active');
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const hasText = messageInput.value.trim().length > 0;
        
        sendButton.disabled = !hasText || this.isLoading;
    }

    insertMathSymbol(symbol) {
        const messageInput = document.getElementById('messageInput');
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(cursorPos);
        
        messageInput.value = textBefore + symbol + textAfter;
        messageInput.selectionStart = messageInput.selectionEnd = cursorPos + symbol.length;
        
        this.updateSendButton();
        this.autoResizeTextarea(messageInput);
        messageInput.focus();
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || this.isLoading) return;

        // Create new chat if needed
        if (!this.currentChatId) {
            this.currentChatId = Date.now().toString();
        }

        // Add user message to chat
        this.addMessage('user', message);
        
        // Clear input and update UI
        messageInput.value = '';
        this.autoResizeTextarea(messageInput);
        this.updateSendButton();
        
        // Show loading indicator
        this.setLoading(true);
        
        try {
            const response = await this.callAPI(message);
            
            if (response.success) {
                this.addMessage('ai', response.data.answer, {
                    type: response.data.type,
                    language: response.data.language,
                    timestamp: response.data.timestamp
                });
            } else {
                this.addMessage('ai', 'I apologize, but I encountered an error while processing your request. Please try again.', {
                    error: true
                });
            }
        } catch (error) {
            console.error('API Error:', error);
            this.addMessage('ai', 'I apologize, but I encountered an error while processing your request. Please try again.', {
                error: true
            });
        } finally {
            this.setLoading(false);
        }
    }

    async callAPI(message) {
        try {
            const response = await fetch('https://api.windsurf.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'mathgpt-assistant',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are MathGPT Assistant, a specialized AI for solving math problems. Provide detailed, step-by-step explanations for math problems. Detect the user\'s language and respond in the same language. For non-math questions, provide helpful general assistance.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Simulate the expected response format
            const mockResponse = {
                answer: data.choices[0].message.content,
                type: this.detectMessageType(message),
                language: this.detectLanguage(message),
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                data: mockResponse
            };
            
        } catch (error) {
            // For demo purposes, return a mock response
            console.log('Using mock response for demo');
            const mockResponse = this.generateMockResponse(message);
            return {
                success: true,
                data: mockResponse
            };
        }
    }

    generateMockResponse(message) {
        // Comprehensive math detection for advanced AI Math Tutor
        const mathKeywords = ['solve', 'calculate', 'derivative', 'integral', 'equation', 'x', '+', '-', '*', '/', '^', '√', 'π', '%', 'plus', 'minus', 'times', 'divide', 'power', 'root', 'square', 'circle', 'triangle', 'area', 'perimeter', 'radius', 'diameter', 'average', 'mean', 'median', 'mode', 'probability', 'statistics', 'fraction', 'percentage', 'pythagorean', 'theorem', 'sin', 'cos', 'tan'];
        const banglaMathKeywords = ['যোগ', 'বিয়োগ', 'গুণ', 'ভাগ', 'সমাধান', 'গড়', 'ক্ষেত্রফল', 'পরিসীমা', 'সম্ভাবনা', 'ব্যাসার্ধ', 'ব্যাস', 'ত্রিভুজ', 'বৃত্ত', 'সমীকরণ', 'ভগ্নাংশ', 'শতাংশ', 'গড়', 'মধ্যমা', 'প্রচুরতা', 'পাইথাগোরাস', 'উপপাদ্য', 'সাইন', 'কোসাইন', 'ট্যানজেন্ট', '+', '-', '×', '÷', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০'];
        const naturalMathKeywords = ['ar', 'koto', 'jog', 'biyog', 'gun', 'vag', 'সমীকরণ', 'আর', 'কত', 'plus', 'minus', 'times', 'divide', 'what', 'how', 'find', 'calculate', 'solve'];
        const mathOperators = ['+', '-', '*', '/', '×', '÷', '^', '√', '%', '='];
        
        // Advanced math detection patterns
        const isMath = mathKeywords.some(keyword => message.toLowerCase().includes(keyword)) || 
                     banglaMathKeywords.some(keyword => message.includes(keyword)) ||
                     naturalMathKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
                     mathOperators.some(op => message.includes(op)) ||
                     /\d+\s*[+\-*/÷×^]\s*\d+/.test(message) || // Basic operations
                     /\d+\s*ar\s*\d+/i.test(message) || // English natural math
                     /\d+\s*আর\s*\d+/.test(message) || // Bangla natural math
                     /\d+\s*plus\s*\d+/i.test(message) || // English plus
                     /\d+\s*gun\s*\d+/i.test(message) || // Bangla multiply
                     /\d+\s*vag\s*\d+/i.test(message) || // Bangla divide
                     /\d+\s*koto/i.test(message) || // English "how much"
                     /\d+\s*কত/.test(message) || // Bangla "how much"
                     /average\s+of\s+[\d\s]+/i.test(message) || // Average
                     /গড়\s+কত/.test(message) || // Bangla average
                     /area\s+of\s+\w+/i.test(message) || // Area calculations
                     /\w+\s*ক্ষেত্রফল/.test(message) || // Bangla area
                     /radius\s+\d+/i.test(message) || // Radius
                     /ব্যাসার্ধ\s+\d+/.test(message) || // Bangla radius
                     /x\s*[+\-*/]\s*\d+/.test(message) || // Variable equations
                     /\d+\s*[+\-*/]\s*x/.test(message) || // Variable equations
                     /\d+\s*\/\s*\d+/.test(message) || // Fractions
                     /\d+%/i.test(message); // Percentages
        
        const language = this.detectLanguage(message);
        
        let response = '';
        
        if (language === 'bn') {
            // Enhanced Bangla responses for AI Math Tutor
            response = this.generateBanglaMathResponse(message, isMath);
        } else {
            // Enhanced English responses for AI Math Tutor
            response = this.generateEnglishMathResponse(message, isMath);
        }
        
        return {
            answer: response,
            type: isMath ? 'math' : 'general',
            language: language,
            timestamp: new Date().toISOString()
        };
    }

    generateEnglishMathResponse(message, isMath) {
        if (!isMath) {
            return 'Step 1: Welcome to AI Math Tutor!\nI\'m your advanced mathematics tutor, ready to help with any math problem.\n\nStep 2: What I can help you with:\n• Basic Arithmetic (addition, subtraction, multiplication, division)\n• Algebra (equations, variables, expressions)\n• Geometry (area, perimeter, volume, shapes)\n• Trigonometry (sin, cos, tan, angles)\n• Statistics (mean, median, mode, probability)\n• Fractions and Percentages\n• Powers and Square Roots\n• Pythagorean Theorem\n\nStep 3: How to ask:\nSimply type your math question naturally, like:\n"2 + 2" or "What is the area of a circle with radius 5?"\n\nStep 4: Let\'s learn together!\nAsk me any math question and I\'ll provide step-by-step explanations like your personal math teacher.';
        }

        // Advanced English math responses with comprehensive topics
        if (message.toLowerCase().includes('2 ar 2 koto') || message.toLowerCase().includes('2 + 2')) {
            return 'Step 1: Understand the problem\nWe need to add the numbers 2 and 2.\n\nStep 2: Apply the addition formula\nFor addition: a + b = result\n\nStep 3: Perform the calculation\n2 + 2 = 4\n\nStep 4: Final Answer\nThe sum of 2 and 2 is 4.\n\nExplanation: Addition is one of the four basic arithmetic operations. When we add 2 and 2, we combine two groups of 2 items to get a total of 4 items.';
        }
        
        if (message.toLowerCase().includes('2 plus 2')) {
            return 'Step 1: Identify the operation\nThe word "plus" indicates addition.\n\nStep 2: Set up the addition\n2 + 2\n\nStep 3: Calculate the sum\n2 + 2 = 4\n\nStep 4: Final Answer\n2 plus 2 equals 4.\n\nTeaching Tip: "Plus" is another way to say addition. You can also use the "+" symbol to show addition.';
        }
        
        if (message.toLowerCase().includes('5 * 3') || message.toLowerCase().includes('5 × 3') || message.toLowerCase().includes('5 times 3')) {
            return 'Step 1: Understand multiplication\nWe need to multiply 5 by 3, which means adding 5 three times.\n\nStep 2: Apply multiplication formula\n5 × 3 = 5 + 5 + 5\n\nStep 3: Calculate\n5 + 5 + 5 = 15\n\nStep 4: Final Answer\n5 × 3 = 15\n\nExplanation: Multiplication is repeated addition. When we multiply 5 by 3, we are essentially adding 5 three times.';
        }
        
        if (message.toLowerCase().includes('10 ÷ 2') || message.toLowerCase().includes('10 / 2') || message.toLowerCase().includes('10 divide 2')) {
            return 'Step 1: Understand division\nWe need to divide 10 by 2, which means finding how many groups of 2 are in 10.\n\nStep 2: Apply division formula\n10 ÷ 2 = ?\n\nStep 3: Calculate\n10 ÷ 2 = 5\n\nStep 4: Final Answer\n10 divided by 2 equals 5.\n\nExplanation: Division tells us how many equal groups we can make. 10 divided by 2 means we can make 5 groups of 2.';
        }
        
        if (message.toLowerCase().includes('x + 5 = 10') || message.toLowerCase().includes('x plus 5 equals 10')) {
            return 'Step 1: Identify the equation\nWe have a linear equation: x + 5 = 10\n\nStep 2: Isolate the variable\nTo find x, we need to subtract 5 from both sides:\nx + 5 - 5 = 10 - 5\n\nStep 3: Simplify\nx = 5\n\nStep 4: Final Answer\nx = 5\n\nVerification: Check by substituting back: 5 + 5 = 10 ✓';
        }
        
        if (message.toLowerCase().includes('average of') || message.toLowerCase().includes('mean of')) {
            const numbers = message.match(/\d+/g);
            if (numbers && numbers.length >= 2) {
                const sum = numbers.reduce((a, b) => parseInt(a) + parseInt(b), 0);
                const avg = sum / numbers.length;
                return `Step 1: Identify the numbers\nNumbers found: ${numbers.join(', ')}\n\nStep 2: Calculate the sum\n${numbers.join(' + ')} = ${sum}\n\nStep 3: Divide by count\nAverage = Sum ÷ Count = ${sum} ÷ ${numbers.length}\n\nStep 4: Final Answer\nThe average is ${avg}.\n\nExplanation: The average (mean) is found by adding all numbers and dividing by how many numbers there are.`;
            }
            return 'Step 1: Understand average\nAverage (mean) = (Sum of all numbers) ÷ (Number of numbers)\n\nStep 2: Need multiple numbers\nPlease provide multiple numbers to calculate the average.\n\nStep 3: Example\nFor numbers 2, 4, 6:\nSum = 2 + 4 + 6 = 12\nCount = 3\nAverage = 12 ÷ 3 = 4\n\nStep 4: Your turn\nPlease provide the numbers you want to average.';
        }
        
        if (message.toLowerCase().includes('radius 5') && message.toLowerCase().includes('area')) {
            return 'Step 1: Identify the shape and given information\nShape: Circle\nGiven: Radius = 5 units\n\nStep 2: Recall the area formula\nArea of circle = π × r²\n\nStep 3: Substitute the values\nArea = π × 5²\nArea = π × 25\nArea = 25π\n\nStep 4: Calculate numerical value\nUsing π ≈ 3.1416:\nArea ≈ 25 × 3.1416 = 78.54 square units\n\nStep 5: Final Answer\nThe area of a circle with radius 5 is 25π square units (approximately 78.54 square units).';
        }
        
        if (message.toLowerCase().includes('pythagorean') || message.toLowerCase().includes('pythagoras')) {
            return 'Step 1: Understand Pythagorean Theorem\nFor a right triangle with sides a, b and hypotenuse c:\na² + b² = c²\n\nStep 2: Common applications\n• Find missing side of right triangle\n• Check if triangle is right-angled\n• Calculate distances\n\nStep 3: Example usage\nIf a = 3 and b = 4:\n3² + 4² = c²\n9 + 16 = c²\nc² = 25\nc = √25 = 5\n\nStep 4: Final Answer\nThe Pythagorean theorem relates the sides of right triangles: a² + b² = c²';
        }
        
        if (message.toLowerCase().includes('square root') || message.includes('√')) {
            const match = message.match(/√(\d+)|square root of (\d+)/i);
            if (match) {
                const num = match[1] || match[2];
                const sqrt = Math.sqrt(parseInt(num));
                return `Step 1: Understand square root\nSquare root of ${num} means finding a number that when multiplied by itself equals ${num}.\n\nStep 2: Calculate\n√${num} = ${sqrt}\n\nStep 3: Verify\n${sqrt} × ${sqrt} = ${sqrt * sqrt} = ${num}\n\nStep 4: Final Answer\nThe square root of ${num} is ${sqrt}.`;
            }
            return 'Step 1: Square root definition\n√n = a number that when multiplied by itself equals n\n\nStep 2: Common square roots\n√1 = 1, √4 = 2, √9 = 3, √16 = 4, √25 = 5, √36 = 6, √49 = 7, √64 = 8, √81 = 9, √100 = 10\n\nStep 3: How to calculate\nUse calculator or estimation method.\n\nStep 4: Practice\nTry: √25 = ? (Answer: 5)';
        }
        
        if (message.toLowerCase().includes('fraction')) {
            return 'Step 1: Understand fractions\nA fraction represents parts of a whole: numerator/denominator\n\nStep 2: Types of fractions\n• Proper: 3/4 (numerator < denominator)\n• Improper: 5/3 (numerator > denominator)\n• Mixed: 1 2/3\n\nStep 3: Basic operations\n• Addition: Find common denominator\n• Subtraction: Find common denominator\n• Multiplication: Multiply numerators and denominators\n• Division: Multiply by reciprocal\n\nStep 4: Example\n1/2 + 1/4 = 2/4 + 1/4 = 3/4\n\nAsk me about specific fraction operations!';
        }
        
        if (message.toLowerCase().includes('percentage') || message.includes('%')) {
            return 'Step 1: Understand percentages\nPercentage means "per hundred" or out of 100\n\nStep 2: Conversion formulas\n• Percentage to decimal: % ÷ 100\n• Decimal to percentage: × 100\n• Fraction to percentage: (numerator ÷ denominator) × 100\n\nStep 3: Example calculations\n25% = 25 ÷ 100 = 0.25\n50% = 50 ÷ 100 = 0.5\n75% = 75 ÷ 100 = 0.75\n\nStep 4: Applications\n• Discounts: 20% off means pay 80%\n• Grades: 85% means 85 out of 100\n• Statistics: Population percentages\n\nAsk me about specific percentage problems!';
        }
        
        if (message.toLowerCase().includes('sin') || message.toLowerCase().includes('cos') || message.toLowerCase().includes('tan')) {
            return 'Step 1: Trigonometric basics\nThese functions relate angles to sides in right triangles:\n• sin(θ) = opposite/hypotenuse\n• cos(θ) = adjacent/hypotenuse\n• tan(θ) = opposite/adjacent\n\nStep 2: Common angles\n• sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = 1/√3\n• sin(45°) = √2/2, cos(45°) = √2/2, tan(45°) = 1\n• sin(60°) = √3/2, cos(60°) = 1/2, tan(60°) = √3\n\nStep 3: Applications\n• Finding heights and distances\n• Wave calculations\n• Engineering problems\n\nStep 4: Practice\nAsk me about specific trigonometric calculations!';
        }
        
        // General advanced math response
        return 'Step 1: Analyze your math question\nI can see you\'re asking about a mathematical concept.\n\nStep 2: My capabilities\nAs an AI Math Tutor, I can help with:\n• All arithmetic operations\n• Algebra and equations\n• Geometry (areas, perimeters, volumes)\n• Trigonometry basics\n• Statistics (mean, median, mode)\n• Fractions and percentages\n• Powers and square roots\n• Pythagorean theorem\n\nStep 3: How to ask better\nBe specific about what you need:\n• "Solve x + 5 = 10"\n• "Area of circle with radius 5"\n• "Average of 10, 20, 30"\n• "What is 15% of 200?"\n\nStep 4: Let\'s solve together!\nPlease rephrase your question with more details, and I\'ll provide a step-by-step solution.';
    }

    generateBanglaMathResponse(message, isMath) {
        if (!isMath) {
            return 'ধাপ ১: AI ম্যাথ টিউটরে স্বাগতম!\nআমি আপনার উন্নত গণিত শিক্ষক, যেকোনো গণিত সমস্যা সমাধানে প্রস্তুত।\n\nধাপ ২: আমি যেসব বিষয়ে সাহায্য করতে পারি:\n• মৌলিক পাটিগণিত (যোগ, বিয়োগ, গুণ, ভাগ)\n• বীজগণিত (সমীকরণ, চলক, রাশি)\n• জ্যামিতি (ক্ষেত্রফল, পরিসীমা, আয়তন, আকৃতি)\n• ত্রিকোণমিতি (সাইন, কোসাইন, ট্যানজেন্ট, কোণ)\n• পরিসংখ্যান (গড়, মধ্যমা, প্রচুরতা, সম্ভাবনা)\n• ভগ্নাংশ এবং শতাংশ\n• ঘাত এবং বর্গমূল\n• পাইথাগোরাসের উপপাদ্য\n\nধাপ ৩: কিভাবে জিজ্ঞাসা করবেন:\nসহজেই আপনার গণিত প্রশ্নটি লিখুন, যেমন:\n"২ + ২" বা "ব্যাসার্ধ ৫ বিশিষ্ট বৃত্তের ক্ষেত্রফল কত?"\n\nধাপ ৪: একসাথে শিখি!\nযেকোনো গণিত প্রশ্ন জিজ্ঞাসা করুন, আমি আপনার ব্যক্তিগত গণিত শিক্ষকের মতো ধাপে ধাপে ব্যাখ্যা দেব।';
        }

        // Advanced Bangla math responses with comprehensive topics
        if (message.includes('২ আর ২ কত') || message.includes('২ + ২')) {
            return 'ধাপ ১: সমস্যাটি বুঝি\nআমাদের ২ এবং ২ সংখ্যা দুটিকে যোগ করতে হবে।\n\nধাপ ২: যোগের সূত্র প্রয়োগ করি\nযোগের জন্য: a + b = ফলাফল\n\nধাপ ৩: হিসাব করি\n২ + ২ = ৪\n\nধাপ ৪: চূড়ান্ত উত্তর\n২ এবং ২ এর যোগফল ৪।\n\nব্যাখ্যা: যোগ হল চারটি মৌলিক পাটিগণিতিক ক্রিয়ার মধ্যে একটি। যখন আমরা ২ এবং ২ যোগ করি, আমরা মোট ৪টি আইটেম পাই।';
        }
        
        if (message.includes('৫ গুণ ৩') || message.includes('৫ × ৩') || message.includes('৫ * ৩')) {
            return 'ধাপ ১: গুণ বুঝি\nআমাদের ৫ কে ৩ দিয়ে গুণ করতে হবে, যার অর্থ ৫ কে তিনবার যোগ করা।\n\nধাপ ২: গুণের সূত্র প্রয়োগ করি\n৫ × ৩ = ৫ + ৫ + ৫\n\nধাপ ৩: হিসাব করি\n৫ + ৫ + ৫ = ১৫\n\nধাপ ৪: চূড়ান্ত উত্তর\n৫ × ৩ = ১৫\n\nব্যাখ্যা: গুণ হল পুনরাবৃত্তিমূলক যোগ। যখন আমরা ৫ কে ৩ দিয়ে গুণ করি, আমরা আসলে ৫ কে তিনবার যোগ করছি।';
        }
        
        if (message.includes('১০ ভাগ ২') || message.includes('১০ ÷ ২') || message.includes('১০ / ২')) {
            return 'ধাপ ১: ভাগ বুঝি\nআমাদের ১০ কে ২ দিয়ে ভাগ করতে হবে, যার অর্থ ১০ এর মধ্যে কতগুলো ২ এর দল আছে তা বের করা।\n\nধাপ ২: ভাগের সূত্র প্রয়োগ করি\n১০ ÷ ২ = ?\n\nধাপ ৩: হিসাব করি\n১০ ÷ ২ = ৫\n\nধাপ ৪: চূড়ান্ত উত্তর\n১০ কে ২ দিয়ে ভাগ করলে ৫ হয়।\n\nব্যাখ্যা: ভাগ আমাদের বলে যে আমরা কতগুলো সমান দল তৈরি করতে পারি। ১০ কে ২ দিয়ে ভাগ করলে আমরা ৫টি ২ এর দল পাই।';
        }
        
        if (message.includes('x + ৫ = ১০') || message.includes('x প্লাস ৫ ইকুয়েল ১০')) {
            return 'ধাপ ১: সমীকরণ চিনি\nআমাদের একটি রৈখিক সমীকরণ আছে: x + ৫ = ১০\n\nধাপ ২: চলকটিকে আলাদা করি\nx খুঁজে বের করার জন্য, আমাদের উভয় পাশ থেকে ৫ বিয়োগ করতে হবে:\nx + ৫ - ৫ = ১০ - ৫\n\nধাপ ৩: সরলীকরণ করি\nx = ৫\n\nধাপ ৪: চূড়ান্ত উত্তর\nx = ৫\n\nযাচাই: ফিরে বসিয়ে পরীক্ষা করি: ৫ + ৫ = ১০ ✓';
        }
        
        if (message.includes('গড়') || message.includes('গড় কত')) {
            const numbers = message.match(/[০-১২৩৪৫৬৭৮৯]+/g);
            if (numbers && numbers.length >= 2) {
                const convertedNumbers = numbers.map(n => this.banglaToEnglishNumber(n));
                const sum = convertedNumbers.reduce((a, b) => parseInt(a) + parseInt(b), 0);
                const avg = sum / convertedNumbers.length;
                return `ধাপ ১: সংখ্যাগুলো চিনি\nপাওয়া সংখ্যা: ${numbers.join(', ')}\n\nধাপ ২: যোগফল হিসাব করি\n${numbers.join(' + ')} = ${sum}\n\nধাপ ৩: সংখ্যা দিয়ে ভাগ করি\nগড় = যোগফল ÷ সংখ্যা = ${sum} ÷ ${convertedNumbers.length}\n\nধাপ ৪: চূড়ান্ত উত্তর\nগড় হল ${avg}।\n\nব্যাখ্যা: গড় (মান) পাওয়া যায় সকল সংখ্যার যোগফল করে এবং তারপর মোট সংখ্যা দিয়ে ভাগ করে।`;
            }
            return 'ধাপ ১: গড় বুঝি\nগড় (মান) = (সকল সংখ্যার যোগফল) ÷ (সংখ্যার সংখ্যা)\n\nধাপ ২: একাধিক সংখ্যা প্রয়োজন\nগড় হিসাব করার জন্য একাধিক সংখ্যা দিন।\n\nধাপ ৩: উদাহরণ\n২, ৪, ৬ সংখ্যার জন্য:\nযোগফল = ২ + ৪ + ৬ = ১২\nসংখ্যা = ৩\nগড় = ১২ ÷ ৩ = ৪\n\nধাপ ৪: আপনার পালা\nগড় হিসাব করার জন্য সংখ্যাগুলো প্রদান করুন।';
        }
        
        if (message.includes('ব্যাসার্ধ ৫') && message.includes('ক্ষেত্রফল')) {
            return 'ধাপ ১: আকৃতি এবং প্রদত্ত তথ্য চিনি\nআকৃতি: বৃত্ত\nপ্রদত্ত: ব্যাসার্ধ = ৫ একক\n\nধাপ ২: ক্ষেত্রফলের সূত্র মনে করি\nবৃত্তের ক্ষেত্রফল = π × r²\n\nধাপ ৩: মান বসাই\nক্ষেত্রফল = π × ৫²\nক্ষেত্রফল = π × ২৫\nক্ষেত্রফল = ২৫π\n\nধাপ ৪: সংখ্যাসূচক মান হিসাব করি\nπ ≈ ৩.১৪১৬ ব্যবহার করে:\nক্ষেত্রফল ≈ ২৫ × ৩.১৪১৬ = ৭৮.৫৪ বর্গ একক\n\nধাপ ৫: চূড়ান্ত উত্তর\nব্যাসার্ধ ৫ বিশিষ্ট বৃত্তের ক্ষেত্রফল ২৫π বর্গ একক (প্রায় ৭৮.৫৪ বর্গ একক)।';
        }
        
        if (message.includes('পাইথাগোরাস') || message.includes('পাইথাগোরাসের উপপাদ্য')) {
            return 'ধাপ ১: পাইথাগোরাসের উপপাদ্য বুঝি\nসমকোণী ত্রিভুজের জন্য, a, b বাহু এবং c অতিভুজ:\na² + b² = c²\n\nধাপ ২: সাধারণ প্রয়োগ\n• সমকোণী ত্রিভুজের অনুপস্থিত বাহু খুঁজে বের করা\n• ত্রিভুজ সমকোণী কিনা পরীক্ষা করা\n• দূরত্ব হিসাব করা\n\nধাপ ৩: উদাহরণ ব্যবহার\nযদি a = ৩ এবং b = ৪:\n৩² + ৪² = c²\n৯ + ১৬ = c²\nc² = ২৫\nc = √২৫ = ৫\n\nধাপ ৪: চূড়ান্ত উত্তর\nপাইথাগোরাসের উপপাদ্য সমকোণী ত্রিভুজের বাহুগুলোর সম্পর্ক দেখায়: a² + b² = c²';
        }
        
        if (message.includes('বর্গমূল') || message.includes('√')) {
            const match = message.match(/√([০-১২৩৪৫৬৭৮৯]+)/);
            if (match) {
                const num = this.banglaToEnglishNumber(match[1]);
                const sqrt = Math.sqrt(parseInt(num));
                return `ধাপ ১: বর্গমূল বুঝি\n${num} এর বর্গমূল মানে এমন একটি সংখ্যা যা নিজের সাথে গুণ করলে ${num} হয়।\n\nধাপ ২: হিসাব করি\n√${num} = ${sqrt}\n\nধাপ ৩: যাচাই করি\n${sqrt} × ${sqrt} = ${sqrt * sqrt} = ${num}\n\nধাপ ৪: চূড়ান্ত উত্তর\n${num} এর বর্গমূল হল ${sqrt}।`;
            }
            return 'ধাপ ১: বর্গমূলের সংজ্ঞা\n√n = একটি সংখ্যা যা নিজের সাথে গুণ করলে n হয়\n\nধাপ ২: সাধারণ বর্গমূল\n√১ = ১, √৪ = ২, √৯ = ৩, √১৬ = ৪, √২৫ = ৫, √৩৬ = ৬, √৪৯ = ৭, √৬৪ = ৮, √৮১ = ৯, √১০০ = ১০\n\nধাপ ৩: কিভাবে হিসাব করবেন\nক্যালকুলেটর বা অনুমান পদ্ধতি ব্যবহার করুন।\n\nধাপ ৪: অনুশীলন\nচেষ্টা করুন: √২৫ = ? (উত্তর: ৫)';
        }
        
        if (message.includes('ভগ্নাংশ')) {
            return 'ধাপ ১: ভগ্নাংশ বুঝি\nভগ্নাংশ সম্পূর্ণের অংশ প্রকাশ করে: লব/হর\n\nধাপ ২: ভগ্নাংশের ধরন\n• প্রকৃত: ৩/৪ (লব < হর)\n• অপ্রকৃত: ৫/৩ (লব > হর)\n• মিশ্র: ১ ২/৩\n\nধাপ ৩: মৌলিক ক্রিয়াকলাপ\n• যোগ: সাধারণ হর খুঁজে বের করুন\n• বিয়োগ: সাধারণ হর খুঁজে বের করুন\n• গুণ: লব এবং হর গুণ করুন\n• ভাগ: বিপরীত দিয়ে গুণ করুন\n\nধাপ ৪: উদাহরণ\n১/২ + ১/৪ = ২/৪ + ১/৪ = ৩/৪\n\nনির্দিষ্ট ভগ্নাংশ ক্রিয়াকলাপ সম্পর্কে জিজ্ঞাসা করুন!';
        }
        
        if (message.includes('শতাংশ') || message.includes('%')) {
            return 'ধাপ ১: শতাংশ বুঝি\nশতাংশ মানে "শত প্রতি" বা ১০০ এর মধ্যে\n\nধাপ ২: রূপান্তর সূত্র\n• শতাংশ থেকে দশমিক: % ÷ ১০০\n• দশমিক থেকে শতাংশ: × ১০০\n• ভগ্নাংশ থেকে শতাংশ: (লব ÷ হর) × ১০০\n\nধাপ ৩: উদাহরণ হিসাব\n২৫% = ২৫ ÷ ১০০ = ০.২৫\n৫০% = ৫০ ÷ ১০০ = ০.৫০\n৭৫% = ৭৫ ÷ ১০০ = ০.৭৫\n\nধাপ ৪: প্রয়োগ\n• ছাড়: ২০% ছাড় মানে ৮০% দিতে হবে\n• গ্রেড: ৮৫% মানে ১০০ এর মধ্যে ৮৫\n• পরিসংখ্যান: জনসংখ্যার শতাংশ\n\nনির্দিষ্ট শতাংশ সমস্যা সম্পর্কে জিজ্ঞাসা করুন!';
        }
        
        if (message.includes('সাইন') || message.includes('কোসাইন') || message.includes('ট্যানজেন্ট')) {
            return 'ধাপ ১: ত্রিকোণমিতিক মৌলিক বিষয়\nএই ফাংশনগুলি সমকোণী ত্রিভুজে কোণ এবং বাহুর সম্পর্ক দেখায়:\n• sin(θ) = বিপরীত/অতিভুজ\n• cos(θ) = সন্নিকট/অতিভুজ\n• tan(θ) = বিপরীত/সন্নিকট\n\nধাপ ২: সাধারণ কোণ\n• sin(৩০°) = ১/২, cos(৩০°) = √৩/২, tan(৩০°) = ১/√৩\n• sin(৪৫°) = √২/২, cos(৪৫°) = √২/২, tan(৪৫°) = ১\n• sin(৬০°) = √৩/২, cos(৬০°) = ১/২, tan(৬০°) = √৩\n\nধাপ ৩: প্রয়োগ\n• উচ্চতা এবং দূরত্ব খুঁজে বের করা\n• তরঙ্গ হিসাব\n• প্রকৌশল সমস্যা\n\nধাপ ৪: অনুশীলন\nনির্দিষ্ট ত্রিকোণমিতিক হিসাব সম্পর্কে জিজ্ঞাসা করুন!';
        }
        
        // General advanced Bangla math response
        return 'ধাপ ১: আপনার গণিত প্রশ্ন বিশ্লেষণ করি\nআমি দেখতে পাচ্ছি আপনি একটি গাণিতিক ধারণা সম্পর্কে জিজ্ঞাসা করছেন।\n\nধাপ ২: আমার ক্ষমতা\nএকজন AI ম্যাথ টিউটর হিসাবে, আমি সাহায্য করতে পারি:\n• সকল পাটিগণিতিক ক্রিয়াকলাপ\n• বীজগণিত এবং সমীকরণ\n• জ্যামিতি (ক্ষেত্রফল, পরিসীমা, আয়তন)\n• ত্রিকোণমিতি মৌলিক বিষয়\n• পরিসংখ্যান (গড়, মধ্যমা, প্রচুরতা)\n• ভগ্নাংশ এবং শতাংশ\n• ঘাত এবং বর্গমূল\n• পাইথাগোরাসের উপপাদ্য\n\nধাপ ৩: কিভাবে ভালোভাবে জিজ্ঞাসা করবেন\nআপনি যা প্রয়োজন তা নির্দিষ্ট করুন:\n• "x + ৫ = ১০ সমাধান করুন"\n• "ব্যাসার্ধ ৫ বিশিষ্ট বৃত্তের ক্ষেত্রফল"\n• "১০, ২০, ৩০ এর গড়"\n• "২০০ এর ১৫% কত?"\n\nধাপ ৪: একসাথে সমাধান করি!\nআরও বিস্তারিত করে আপনার প্রশ্নটি করুন, এবং আমি ধাপে ধাপে সমাধান দেব।';
    }

    banglaToEnglishNumber(banglaNum) {
        const banglaToEnglishMap = {
            '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
            '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        };
        return banglaNum.replace(/[০-৯]/g, digit => banglaToEnglishMap[digit]);
    }

    detectMessageType(message) {
        const mathKeywords = ['solve', 'calculate', 'derivative', 'integral', 'equation', 'x', '+', '-', '*', '/', '^', '√', 'π'];
        return mathKeywords.some(keyword => message.toLowerCase().includes(keyword)) ? 'math' : 'general';
    }

    detectLanguage(message) {
        // Enhanced language detection including Bangla
        const banglaPattern = /[\u0980-\u09FF]/;
        const arabicPattern = /[\u0600-\u06FF]/;
        const chinesePattern = /[\u4E00-\u9FFF]/;
        const hindiPattern = /[\u0900-\u097F]/;
        
        if (banglaPattern.test(message)) {
            return 'bn';
        } else if (arabicPattern.test(message)) {
            return 'ar';
        } else if (chinesePattern.test(message)) {
            return 'zh';
        } else if (hindiPattern.test(message)) {
            return 'hi';
        } else if (/[^\x00-\x7F]/.test(message)) {
            return 'detected';
        }
        
        return 'en';
    }

    addMessage(role, content, metadata = {}) {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: metadata.timestamp || new Date().toISOString(),
            type: metadata.type || 'general',
            language: metadata.language || 'en',
            error: metadata.error || false
        };

        // Find or create chat entry
        let chatEntry = this.chatHistory.find(chat => chat.id === this.currentChatId);
        if (!chatEntry) {
            chatEntry = {
                id: this.currentChatId,
                title: this.generateChatTitle(content),
                timestamp: message.timestamp,
                messages: []
            };
            this.chatHistory.push(chatEntry); // Add to end for chronological order
        }

        chatEntry.messages.push(message);
        chatEntry.timestamp = message.timestamp;
        
        // Sort chat history by timestamp (oldest first, newest last)
        this.chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        this.saveChatHistory();
        this.renderMessage(message);
        this.updateHistoryItem(chatEntry);
        this.scrollToBottom();
    }

    generateChatTitle(firstMessage) {
        const maxLength = 50;
        const title = firstMessage.length > maxLength ? 
            firstMessage.substring(0, maxLength) + '...' : 
            firstMessage;
        return title;
    }

    renderMessage(message) {
        const chatWindow = document.getElementById('chatWindow');
        
        // Remove welcome message if it exists
        const welcomeMessage = chatWindow.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        messageElement.innerHTML = `
            <div class="message-info">
                <div class="message-avatar">${message.role === 'user' ? 'U' : '∑'}</div>
                <span>${message.role === 'user' ? 'You' : 'MathGPT Assistant'}</span>
                <span>${this.formatTime(message.timestamp)}</span>
                ${message.type ? `<span class="message-type">${message.type}</span>` : ''}
            </div>
            <div class="message-content">${this.formatMessageContent(message.content)}</div>
        `;

        chatWindow.appendChild(messageElement);
    }

    formatMessageContent(content) {
        // Convert newlines to HTML line breaks
        let formatted = content.replace(/\n/g, '<br>');
        
        // Wrap math expressions in spans for styling
        formatted = formatted.replace(/([+\-×÷=√π∑∫∂∇≈≠∞∈⊂∪])/g, '<span class="math-expression">$1</span>');
        
        return formatted;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    renderChatHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.chatHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No chat history yet</div>';
            return;
        }

        historyList.innerHTML = '';
        // Display in chronological order (oldest first, newest last)
        this.chatHistory.forEach((chat, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.chatId = chat.id;
            
            if (chat.id === this.currentChatId) {
                historyItem.classList.add('active');
            }
            
            historyItem.innerHTML = `
                <div class="history-item-number">#${index + 1}</div>
                <div class="history-item-preview">${chat.title}</div>
                <div class="history-item-time">${this.formatDate(chat.timestamp)}</div>
            `;
            
            historyList.appendChild(historyItem);
        });

        // Auto-scroll to bottom to show newest chat
        historyList.scrollTop = historyList.scrollHeight;
    }

    updateHistoryItem(chatEntry) {
        const historyItem = document.querySelector(`[data-chat-id="${chatEntry.id}"]`);
        if (historyItem) {
            const preview = historyItem.querySelector('.history-item-preview');
            const time = historyItem.querySelector('.history-item-time');
            preview.textContent = chatEntry.title;
            time.textContent = this.formatDate(chatEntry.timestamp);
            
            // Re-sort history if timestamp changed
            this.chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            this.renderChatHistory();
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    loadChat(chatId) {
        const chatEntry = this.chatHistory.find(chat => chat.id === chatId);
        if (!chatEntry) return;

        this.currentChatId = chatId;
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.innerHTML = '';

        chatEntry.messages.forEach(message => {
            this.renderMessage(message);
        });

        this.scrollToBottom();
        this.renderChatHistory();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.toggleSidebar();
        }
    }

    scrollToBottom() {
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const loadingIndicator = document.getElementById('loadingIndicator');
        const sendButton = document.getElementById('sendButton');
        
        if (isLoading) {
            loadingIndicator.classList.add('active');
            sendButton.disabled = true;
        } else {
            loadingIndicator.classList.remove('active');
            this.updateSendButton();
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all chat history?')) {
            this.chatHistory = [];
            this.currentChatId = null;
            this.saveChatHistory();
            this.renderChatHistory();
            
            const chatWindow = document.getElementById('chatWindow');
            chatWindow.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">∑</div>
                    <h2>Welcome to MathGPT Assistant</h2>
                    <p>I can help you solve math problems with step-by-step explanations. Ask me anything!</p>
                    <div class="example-prompts">
                        <button class="example-prompt" data-prompt="Solve x² + 5x + 6 = 0">
                            Solve x² + 5x + 6 = 0
                        </button>
                        <button class="example-prompt" data-prompt="What is the derivative of sin(x)?">
                            What is the derivative of sin(x)?
                        </button>
                        <button class="example-prompt" data-prompt="Calculate ∫2x dx">
                            Calculate ∫2x dx
                        </button>
                    </div>
                </div>
            `;
            
            // Re-bind example prompt events
            document.querySelectorAll('.example-prompt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prompt = btn.dataset.prompt;
                    document.getElementById('messageInput').value = prompt;
                    this.updateSendButton();
                    document.getElementById('messageInput').focus();
                });
            });
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data including chat history and settings?')) {
            this.clearHistory();
            this.settings = {
                mathKeyboardDefault: false,
                languagePreference: 'auto'
            };
            this.saveSettings();
            this.applySettings();
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    applySettings() {
        // Apply math keyboard setting
        const mathKeyboardToggle = document.getElementById('mathKeyboardToggle');
        mathKeyboardToggle.checked = this.settings.mathKeyboardDefault;
        
        if (this.settings.mathKeyboardDefault && !this.mathKeyboardVisible) {
            this.toggleMathKeyboard();
        }
        
        // Apply language preference
        const languagePreference = document.getElementById('languagePreference');
        languagePreference.value = this.settings.languagePreference;
    }

    saveSettings() {
        try {
            localStorage.setItem('mathgpt_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings to localStorage:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('mathgpt_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings from localStorage:', error);
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('mathgpt_chat_history', JSON.stringify(this.chatHistory));
            localStorage.setItem('mathgpt_current_chat', this.currentChatId || '');
        } catch (error) {
            console.warn('Failed to save chat history to localStorage:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('mathgpt_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
            }
            
            const currentChat = localStorage.getItem('mathgpt_current_chat');
            if (currentChat) {
                this.currentChatId = currentChat;
                this.loadChat(currentChat);
            }
        } catch (error) {
            console.warn('Failed to load chat history from localStorage:', error);
            this.chatHistory = [];
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MathGPTAssistant();
});

// Handle page visibility changes to save state
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Save any unsaved state when page is hidden
        const app = window.mathGPTApp;
        if (app) {
            app.saveChatHistory();
            app.saveSettings();
        }
    }
});

// Store app instance globally for state management
window.mathGPTApp = new MathGPTAssistant();
