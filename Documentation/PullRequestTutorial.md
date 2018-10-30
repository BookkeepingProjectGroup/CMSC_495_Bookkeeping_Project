### Adding changes to the repository ###

#### Overview ####

For the purposes of clear, visible, and readily-accessible documentation, all changes made to files in the main project repository must be undertaken via pull requests. Though all contributors have administrative access in the form of the "owner" access privilege and can thus commit changes directly to the master branch, this is not advised as these contributions will be undocumented and buried deep in the file history. Instead, the use of reviewed pull requests will enable the group as a whole to see each individual's contributions and comment on all changes as needed before they are added to the production build, empowering members to request changes, suggest alternative approaches, and check for bugs prior to the code being committed.

To this end, in order for a pull request's fork to be merged with the main branch, at least one (1) member of the group must review the proposed changes and either approve, request changes, or close the pull request, tagging the pull request with the relevant label. Once approval is given, the fork can be merged and subsequently deleted to prevent a buildup of disparate forks. You may wish to refer to an example like [this](https://github.com/BookkeepingProjectGroup/CMSC_495_Bookkeeping_Project/pull/4) as an illustration of a reviewed pull request making use of color-coded labels, review functionality, and summarized comment blocks.

The only files that do not require pull requests to edit or add to the repository are files related to documentation, i.e. `.md` markdown files, `.pdf` file uploads, image screenshot additions, etc. Pull requests should be restricted to issues related to production code rather than simple grammar/syntax fixes in documentation files. Feel free to edit this page as required, for example.

#### Tutorial ####

Creating pull requests is not overly involved. To begin, navigate to the file in the repository to which you intend to make changes and press the "Edit this file" pencil sprite to begin editing its contents. Once satisfied with your revisions, scroll down to the bottom of the page to the "Commit changes" box, providing a title consisting of the name of the language in which you were writing (i.e. "JavaScript", "PHP", etc.), followed by a hyphen and a short summary of the changes. In the summary box, provide a slightly longer discussion of your changes. Once finished, press the "Create new branch for this commit and start a pull request" radio button and press the "Propose file change" button. You do not need to adjust the name of the fork itself (i.e. `andreweissen-patch-1`).

#### Example ####

Let's say you want to edit [app.js](https://github.com/BookkeepingProjectGroup/CMSC_495_Bookkeeping_Project/blob/master/Files/js/app.js) with the intention of adding some utility functions. Neat.
* First, press the pencil sprite on the top-right toolbar to edit.
* Make your changes to the file's contents.
* Scroll down to the "Commit changes" modal.
* Title your changes as "`JavaScript - Addition of utility functions`"
* Provide a longer description in the summary box.
* Press the "Create new branch for this commit and start a pull request" radio button.
* Leave fork name as "`yourname-patch-1`".
* Press the "Propose file change" button.
* Accept the changes in the page redirect.
* That's it!
