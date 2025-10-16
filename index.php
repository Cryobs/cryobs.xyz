<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>something</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
<?php 
// get .env
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
?>
    <nav id="nav-small" class="small">
      <div id="logo-wrapper">
        <div id="logo-container">
          <h1 id="logo">cryobs.xyz</h1>
          <span id="logo-status">Play Minecraft!</span>
        </div>
      </div>


      <input type="checkbox" id="nav-toggle">

      <label id="nav-button" for="nav-toggle">
        <span id="arrow">&gt;</span> navigation
      </label>

      <div id="nav-list">
        <ul>
          <a href="/" class="hover"><li><span>home</span></li></a>
          <a href="about-me"><li><span>about me</span></li></a>
          <a href="blog"><li><span>blog</span></li></a>
          <a href="portfolio"><li><span>portfolio</span></li></a>
        </ul>
      </div>
    </nav>
    <div class="flex-container"> 
      <div id="main-section">
        <section>
          <div id="logo-container">
            <h1 id="logo">cryobs.xyz</h1>
            <span id="logo-status">Play Minecraft!</span>
          </div>
          <p>
          Hello, I'm 17 years old computer enthusiast, and this is my website
          created with the idea of isolating myself from "social networks" 
          while still keeping my ability to create 
          and with no <a href="link-to-article">JS</a>. :)
          </p>  
          <p>
          I'll post my projects here. Nothing fancy just code, ideas, and
          experiments. I love DevOps stuff also some low-level (C, ASM).
          </p>
        </section>

        <div class="vertical-split">
          
          <section id="systems-status">
            <span class="header" >Systems status</span>
            <div>Server: [OK]</div>
            <div>Server: [OK]</div>
            <div>Server: [OK]</div>
            <div>Server: [OK]</div>
          </section>

          <div id="contact-info">
            <div class="header">contact info:</div>
            <div>my@email.com</div>
            <div>my@email.com</div>
            <div>my@email.com</div>
          </div>
        </div>
        
        <section id="current-focus">
          <span class="header" >lately I've been into</span>
          <p>my website</p>
          <p>Project: Fenix (book)</p>
          <p>Truman show (film)</p>
        </section>
 
        <section id="latest-post">
          <span class="header" >latest post</span>
          <p>smth will be here</p>
        </section>

        <footer>
<?php
// VISITORS INCREMENT
$format = "est. 2025 * visitor nr ";

// get variables
$host = $_ENV['DB_HOST'];
$db   = $_ENV['DB_NAME'];
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];

try {
  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC 
  ]);
  $pdo->exec("UPDATE site_stats SET visits = visits + 1 WHERE id = 1");

  $stmt = $pdo->query("SELECT visits FROM site_stats WHERE id = 1");

  $results = $stmt->fetchAll();

  echo $format . $results[0]['visits'] . "#";

} catch (PDOException $e) {
  echo $format . "?";
}
?>
        </footer>

      </div>
      <aside id="aside-right">
        <img id="aside-img" src="static/hotel-panorama.jpg">
        <section id="nav-list">
          <span class="header">navigation</span>
          <ul>
            <a href="/" class="hover"><li><span>home</span></li></a>
            <a href="about-me"><li><span>about me</span></li></a>
            <a href="blog"><li><span>blog</span></li></a>
            <a href="portfolio"><li><span>portfolio</span></li></a>
          </ul>
        </section>
        
        <section id="changelog">
          <span class="header">changelog</span>
          <div id="changelog-list">
<?php
$raw = `git log --pretty=format:'%ad|%s' --date=format:'%d.%m.%y'`;

if ($raw === null) {
  echo "<span>Nothing here.</span>";
  exit;
}

$lines = explode("\n", trim($raw));

foreach ($lines as $line) {
  $parts = explode('|', $line, 2);
  if (count($parts) === 2) {
    $date = htmlspecialchars($parts[0]);
    $message = htmlspecialchars($parts[1]);

    echo "<div class='commit'>";
    echo "<small><strong>$date</strong>: $message</small>";
    echo "</div>";
  }
}
            ?>
          </div>

        </section>
        
        <section id="my-button">
          <span class="header">my button</span>
          <p>
            here must be a button.
          </p>

        </section>
      </aside> 
    </div>
  </body>
</html>
