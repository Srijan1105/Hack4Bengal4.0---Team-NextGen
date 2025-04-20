const chatBody = document.getElementById('chatBody');
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const fileUpload = document.getElementById('fileUpload');
        const fileInput = document.getElementById('resultFile');
        const careerForm = document.getElementById('careerForm');
        const analysisReport = document.getElementById('analysisReport');
        
        // Sample predefined bot responses
        const botResponses = [
            "Based on your academic profile, I'd recommend exploring careers in technology, particularly software development or data science. Your strong performance in math and computer science indicates an aptitude for these fields.",
            "Your results show a balanced performance across subjects. Have you considered fields that combine analytical and creative skills, such as architecture or UX design?",
            "I notice you have excellent marks in science subjects. Fields like biotechnology, medicine, or engineering might be good fits for your skillset. Do you have an interest in any of these areas?",
            "Your academic strengths suggest you'd excel in quantitative fields. Would you like me to provide more information about careers in finance, economics, or data analytics?",
            "Looking at your performance and interests, I'd recommend exploring computer science degrees with AI specialization. Universities like IIT, BITS Pilani, and NIT offer excellent programs in this field."
        ];
        
        // Chat functionality
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message !== '') {
                // Add user message
                addMessage(message, 'user');
                chatInput.value = '';
                
                // Simulate bot thinking
                setTimeout(() => {
                    // Get random response from predefined answers
                    const botResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                    addMessage(botResponse, 'bot');
                }, 1000);
            }
        }
        
        function addMessage(message, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${sender}-message`;
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${sender}-bubble`;
            bubble.textContent = message;
            
            messageDiv.appendChild(bubble);
            chatBody.appendChild(messageDiv);
            
            // Scroll to bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        }
        
        // File upload functionality
        fileUpload.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = '#4361ee';
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.borderColor = '#dee2e6';
        });
        
        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = '#dee2e6';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                const fileName = e.dataTransfer.files[0].name;
                showFileName(fileName);
            }
        });
        
        fileInput.addEventListener('change', async () => {
            if (fileInput.files.length === 0) return;
        
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
        
            try {
                const res = await fetch('http://127.0.0.1:5000/upload-file', {
                    method: 'POST',
                    body: formData
                });
        
                const result = await res.json();
                const marks = result.marks;
        
                // Autofill form
                const inputs = document.querySelectorAll('input[placeholder="Enter marks"]');
                const subjects = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English", "Social Studies"];
        
                subjects.forEach((subject, idx) => {
                    if (marks[subject] !== undefined) {
                        inputs[idx].value = marks[subject];
                    }
                });
        
                alert("Marks auto-filled. Generating analysis...");
        
                // 👇 Fetch /analyze using extracted marks + name + interests
                const name = document.querySelector('input[placeholder="Enter your full name"]').value || "Student";
                const interests = document.querySelector('textarea').value || "None";
        
                const payload = { name, marks, interests };
        
                const analysisRes = await fetch('http://127.0.0.1:5000/analyze', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
        
                const analysisData = await analysisRes.json();
        
                // 👇 Show full report + update chart
                displayAnalysis(analysisData);
        
            } catch (err) {
                console.error("OCR/upload error:", err);
                alert("Something went wrong during file analysis.");
            }
        });
        
        
        
        function showFileName(fileName) {
            const fileUploadText = fileUpload.querySelector('.file-upload-text');
            fileUploadText.innerHTML = `<p>Selected file: ${fileName}</p>`;
        }
        
        // Form submission and analysis report display
        careerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
        
            // Collect user input
            const name = document.querySelector('input[placeholder="Enter your full name"]').value;
            const interests = document.querySelector('textarea').value;
        
            const marks = {
                "Mathematics": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[0].value),
                "Physics": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[1].value),
                "Chemistry": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[2].value),
                "Computer Science": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[3].value),
                "English": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[4].value),
                "Social Studies": parseInt(document.querySelectorAll('input[placeholder="Enter marks"]')[5].value)
            };
        
            const payload = {
                name: name,
                marks: marks,
                interests: interests
            };
        
            try {
                const res = await fetch('http://localhost:5000/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
        
                const result = await res.json();
                displayAnalysis(result); // Populate the report dynamically
            } catch (error) {
                alert("Something went wrong while analyzing your results.");
                console.error(error);
            }
        });
        
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        function displayAnalysis(data) {
            const report = document.getElementById('analysisReport');
            report.style.display = 'block';
        
            // Fill in basic info
            report.querySelector('.student-info p:nth-child(1)').innerHTML = `<strong>Student Name:</strong> ${data.name}`;
            report.querySelector('.student-info p:nth-child(3)').innerHTML = `<strong>Date Generated:</strong> ${new Date().toLocaleDateString()}`;
            
            // Academic Strengths
            const strengthsList = report.querySelector('.strengths-list');
            strengthsList.innerHTML = '';
            data.strengths.forEach(str => {
                const li = document.createElement('li');
                li.textContent = str;
                strengthsList.appendChild(li);
            });
        
            // Career Recommendations
            const careerSection = report.querySelectorAll('.career-path');
            careerSection.forEach((section, index) => {
                const recommendation = data.recommendations[index];
                if (recommendation) {
                    section.querySelector('h4').textContent = recommendation.career;
                    section.querySelector('.progress').style.width = `${recommendation.score}%`;
                    section.querySelector('.progress-label span:last-child').textContent = `${recommendation.score}%`;
                }
            });
            const labels = Object.keys(data.marks || {});
    const scores = Object.values(data.marks || {});
    renderChart(data.marks);

    // Show report
    document.getElementById('analysisReport').style.display = 'block';
    // Destroy previous chart if exists
    if (window.subjectChartInstance) {
        window.subjectChartInstance.destroy();
    }

    // Render Chart
    const ctx = document.getElementById('subjectChart').getContext('2d');
    window.subjectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subject Marks (%)',
                data: scores,
                backgroundColor: 'rgba(67, 97, 238, 0.6)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    document.getElementById('downloadPDFBtn').onclick = () => downloadPDF(data);
    document.getElementById('sendEmailBtn').onclick = () => {
        const email = document.querySelector('input[placeholder="Enter your email"]').value;
        if (!email) {
            alert("Please enter your email in the form.");
        } else {
            sendEmail(data, email);
        }
    };
    report.scrollIntoView({ behavior: 'smooth' });
        }
        
        async function downloadPDF(data) {
            const res = await fetch("http://localhost:5000/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        
            if (!res.ok) {
                alert("PDF generation failed.");
                return;
            }
        
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "career_report.pdf";
            a.click();
            window.URL.revokeObjectURL(url);
        }
        
        async function sendEmail(data, email) {
            const res = await fetch("http://localhost:5000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, email })
            });
        
            const msg = await res.json();
            alert(msg.message || "Email sent!");
        }
        function renderChart(marks) {
            const labels = Object.keys(marks);
            const values = Object.values(marks);
        
            const ctx = document.getElementById('subjectChart').getContext('2d');
            if (window.subjectChartInstance) window.subjectChartInstance.destroy();
        
            window.subjectChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Subject Marks',
                        data: values,
                        backgroundColor: 'rgba(67, 97, 238, 0.6)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        