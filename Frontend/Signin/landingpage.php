<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SpendSavvy - Take Control of Your Finances</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>

    :root{
        --primary: #4361ee;
        --secondary: #3f37c9;
    }
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background-color: #f5f7fa;
      color: #4361ee;
    }
    header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .hero {
      padding: 3rem 2rem;
      text-align: center;
      
    }
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      
      
    }
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      
    }
    .cta-buttons a {
      display: inline-block;
      margin: 0.5rem;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
    }
    .cta-primary {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
    }
    .cta-secondary {
      background-color: #ecf0f1;
      color: linear-gradient(135deg, var(--primary), var(--secondary));
    }
    .features {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 2rem;
      max-width: 800px;
      margin: 2rem auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .features h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: white;
    }
    .features ul {
      list-style: none;
      padding: 0;
      color: white;
    }
    .features li {
      margin: 1rem 0;
      font-size: 1.1rem;
      padding-left: 1.5rem;
      position: relative;
      color: white;
    }
    .features li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: white;
      font-weight: bold;
    }

  </style>
</head>
<body>
  <header>
    
    <h1>SpendSavvy</h1>
    
    <p>Track your expenses, set budgets, and achieve your financial goals</p>
  </header>

  <section class="hero">
    <h1>Take Control of Your Finances</h1>
    <p>SpendSavvy helps you manage your money with ease and confidence.</p>
    <div class="cta-buttons">
      <a href="signin.html" class="cta-primary">Get Started Free</a>
      <a href="signin.html" class="cta-secondary">Learn More</a>
    </div>
  </section>

  <section class="features">
    <h2>Why Choose SpendSavvy?</h2>
    <ul>
      <li>Track income and expenses</li>
      <li>Set monthly budgets</li>
      <li>Visualize spending with charts</li>
      <li>Get spending alerts</li>
    </ul>
  </section>
</body>
</html>
