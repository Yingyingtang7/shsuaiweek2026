\# AI Week 2026 Website – Design Plan

This document defines the design requirements, visual style, interaction features, and UI behavior for the AI Week 2026 website. Codex should follow this plan when generating HTML, CSS, JavaScript, and any supporting files.

\---

\#\# 1\. Navigation Components

\#\#\# 1.1 Timeline / Rail Day Selector  
Create a horizontal day selector at the top of the page showing:  
\- Monday  
\- Tuesday  
\- Wednesday  
\- Thursday  
\- Friday  
\- On-demand / TBD

\*\*Behavior\*\*  
\- The timeline acts like a high-tech stepper or roadmap bar.  
\- When a user clicks a day:  
  \- Highlight the selected day using the primary accent color.  
  \- Filter the events below to show only the events for that day.  
  \- Smooth-scroll the page to the event section for that day.  
\- Default view: “All Days” or the first day in the list.

\---

\#\#\# 1.2 View Mode Toggle (Cards vs. Table)  
Provide a toggle at the top that switches between two display modes:

1\. \*\*Card View\*\*    
   \- Event cards arranged in a responsive grid.    
   \- Visual, spacious, ideal for casual readers.

2\. \*\*Table View\*\*    
   \- A structured, compact agenda table.    
   \- Ideal for users who want a fast overview.

\*\*Behavior\*\*  
\- Use JavaScript to hide/show the card layout or the table layout.  
\- Preserve filtering when switching modes.

\---

\#\# 2\. Interactive Event Components

\#\#\# 2.1 Expandable Event Cards  
Each event should initially show:  
\- Title    
\- Time    
\- Location  

When a user clicks or taps an event card:  
\- Expand the card in place (no modal needed).  
\- Show:  
  \- Description  
  \- Moderator or trainer  
  \- Registration notes  
  \- Zoom / Teams link (formatted as a clear button)

The expansion should animate smoothly.

\---

\#\#\# 2.2 “Build My AI Week Plan” (Favorites)  
Users can build a personalized plan by “starring” events.

\*\*Behavior\*\*  
\- Add a small star icon in the corner of each event card.  
\- When the user taps the star:  
  \- Toggle the event as favorited.  
  \- Save favorites to \`localStorage\` so they persist across page refresh.  
\- Include a “My Plan” tab or filter option that displays only favorited events.  
\- Include a “Download My Plan (PDF)” button that exports the selected events as a simple printable PDF (Codex will create the HTML and JS structure; PDF can use \`window.print()\` unless otherwise directed).

\---

\#\# 3\. Micro-Interactions and Motion

\#\#\# 3.1 Micro Animations on Hover  
Apply minimal, clean animations:

\- Buttons:  
  \- Slight scale increase on hover  
  \- Softer shadow on hover

\- Event cards:  
  \- Fade or slide animation when appearing after a filter  
  \- Gentle hover elevation (shadow)

Use CSS transitions and keep everything subtle and refined.

\---

\#\#\# 3.2 AI Pulse in the Header  
In the hero area, near the heading \*\*“AI Week 2026 @ SHSU”\*\*, add a small animated visual element:

\- A softly glowing pulsing dot, or ambient ring effect.  
\- Use lightweight CSS keyframes.  
\- Should feel high-tech but minimal, not distracting.

\---

\#\# 4\. Visual Style and Branding

\#\#\# 4.1 Brand Colors (Required)  
Use \*\*official Sam Houston State University colors\*\* as the design foundation.

\*\*Primary Accent Color\*\*  
\- SHSU Orange: \`\#F56423\`

\*\*Background\*\*  
\- White: \`\#FFFFFF\`

\*\*Neutral Grays\*\*  
These should be used for text, borders, and subtle UI elements:  
\- \`--color-text: \#2A2A2A\`  
\- \`--color-muted: \#6F6F6F\`

\#\#\# 4.2 Design Style Requirements  
The overall site must follow a \*\*high-tech, clean, modern SaaS dashboard aesthetic\*\*.

\*\*Rules\*\*  
\- White or very light backgrounds.  
\- SHSU Orange used only for accents, highlights, active states, and key interactions.  
\- Rounded corners on event cards and buttons.  
\- Soft shadows for elevation, not harsh outlines.  
\- Use a modern sans serif font (Codex chooses a Google Font unless local fonts are required).  
\- Avoid:  
  \- Heavy borders    
  \- Noisy textures    
  \- Overly saturated colors    
  \- Busy decorative elements  

The impression should be:  
\- high-tech    
\- minimal    
\- polished    
\- expensive    
\- clean    
\- university-professional  

\---

\#\# 5\. Layout Principles  
\- Grid-based layout    
\- Consistent spacing    
\- 1–2 column layout on desktop; single column on mobile    
\- Large, breathable margins    
\- Clear visual hierarchy using font size, weight, spacing  

\---

\#\# 6\.

