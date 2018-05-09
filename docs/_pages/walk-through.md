Simulato is a model based testing tool to help provide full and variable coverage to different test paths in Presto. While designed with Presto in mind, simulato is usable currently with any UI that follows regular javascript/HTML paradigms. In order to affiliate yourself with Simulato, there are a couple of concepts you may want to understand first:

Basic Javascript and JSON format
Understanding of the DOM structure and HTML Elements (We use chrome devtools to investigate the DOM)
A high level overview of system you will be modeling
Optional: If modifying the system under test, access to the code base of the system
Process of Simulato
To make use of the tool, you will need to build out a suite of components to reflect your system under test. A Component is a singular piece of the system you are describing in your test suite. For example, we have a basic webpage that has news articles:

![](../assets/test-site-sample.png)

For any given state there are many different things that we can test. 
In this "base state" of a homepage, we could test:
The title banner appeared
Each article appeared
The Icons for each article appeared
Each article has body text
Each article is clickable
And much more
We do not need to generate every possible action and component of a given system.
We can simplify this system into a few basic components isolating the actions and arrangement of elements on the page within a component.
Pieces of a Simulato Component
All of the components are states of a given piece of the system. In this case, we may define some components such as, news articles, homepage, and article modal. We could also make more specific components such as news article text body, but the idea of model based testing is to leave up the structure of the system to the user testing it. The more specific you get, technically the better, but when considering business needs and time required, what you gain from being more specific can be lost in time spent. 
The pieces of a component are split into 5 main categories that will be further discussed below.
Elements - The pieces of data in a give component to be utilized within the model of the component
Models - The arrangement and representation of the elements of a given component
Actions - The interactions with the state of a page and its effects 
Children - A way of "importing" or re-using components within another component
Events - Actions taken in the case of a certain event happening, more often used as inherited actions with children than regular actions(3).



