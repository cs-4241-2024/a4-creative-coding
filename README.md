## Fireflies

http://a4-direlupus.glitch.me

The goal of this application was to expirement with the canvas tag in HTML. I took some inspiration from the game of life, in the grid and placing cells that have rules, however I didn't want each cell to have the same rule. So instead I made 3 different cell types that each release 'children' cells when activated instead of determining propogation. I really liked the idea of cells being able to trigger other cells for really cool visual chain reactions, and thats what I did. 

In some of the earlier versions where the cells didn't delete themselves when activated, the infinite loops were pretty mesmerizing to watch... then I somehow crashed my entire computer (not just the browser -- I have no idea how I pulled that off, Javascript should have dealt with the maximum recursion depth...) so now there are no infinite loops...

There were not any major challenges in the HTML or the javascript that I needed to write, and CSS was just the normal struggle that it always is. I do apologize however because I wrote the majority of this code while sick and with a fever (that was the major challenge) so there is *so* much spaghetti and I deeply apologize for whoever has to parse this codebase. It works though, so thats nice. 

Instructions from the alert should be sufficient, so I will just list everything that is changeable:
  - Cells are added by clicking on the grid
  - Type of cell can be changed through the dropdown on the left
  - Color of the cell can be changed through the color selector or the RGB components on the left
  - Cells can be activated by clicking on them
  - Size of the grid can be altered by the number input and button on the right
  - Background color of the grid can be altered by the color selector on the right
