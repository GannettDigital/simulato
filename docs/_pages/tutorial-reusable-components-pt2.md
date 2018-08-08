---
permalink: /tutorial-reusable-components-pt2/
title: "Creating Reusable Components Part 2"
toc: false
classes: wide
---

In [part 1](/tutorial-reusable-components-pt1) of reusable components, we created a fairly large, bulky elements and model section for articles in our `MainSiteLayout` component. When looking at the elements we added we can start to see a lot of similarities between the two articles. The selectors for each article element can be broken down into two parts, what article it belongs to, and if its a image, heading, or text. So for the `article1heading` we can break it into `article1` and `heading`, and `article2heading` to `article2` and `heading`. This trend follows through for heading, image, and text.  As for the model, each article we are checking the same properties on the page. We are checking `isDisplayed` for the image, heading, and body as well as the `innerText` for heading and body. We can use these commonalities to create one reusable component for articles.

