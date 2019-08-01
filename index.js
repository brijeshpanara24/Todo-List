// List Controller ---------------------------------------------------------------------------------------------------//

var listController = (function(){
    var taskList = [];
    var currentPagePosition = 1;

    return {
        getLength: function() {
            return taskList.length;
        },

        getTask: function(position) {
            return taskList[position];
        },

        deleteTask: function(position) {
            delete(taskList[position]);
        },

        addTask: function(task) {
            taskList.push(task);
        },

        updateTask: function(position, taskText) {
            taskList[position].text = taskText;
        },

        markTaskAsComplete: function(position) {
            taskList[position].complete = true;
        },

        markTaskAsIncomplete: function(position) {
            taskList[position].complete = false;
        },

        getCurrentPage: function() {
            return currentPagePosition;
        },

        setCurrentPage: function (pagePosition) {
            currentPagePosition = Number(pagePosition);
            if(currentPagePosition==null || currentPagePosition===NaN) {
                currentPagePosition=1;
            }
        },

        getActiveTaskCount: function() {
            var count = 0;
            taskList.forEach(function(task) { if(task.complete===false) count++;});
            return count;
        },

        getTaskCount: function() {
            var count = 0;
            taskList.forEach(function(task) { if(task!=null) count++;});
            return count;
        },

        isIncompletePresent: function() {
            return taskList.some(function(task) { return !task.complete; });
        },

        isCompletePresent: function() {
            return taskList.some(function(task) { return task.complete; });
        },

        makeDenseList: function () {
            taskList = taskList.filter(function(x) {return true;});
        },

        clearList: function() {
            taskList = [];
        }
    };
}());





// Options Controller ---------------------------------------------------------------------------------------------//

var optionsController = (function(){

    const PAGE_COUNT = 3;
    const TASK_COUNT = 0;
    const CLEAR_COMPLETED_TASK = 4;

    var options = document.getElementsByClassName("option-container")[0];
    var optionsList = options.getElementsByTagName('p');
    var selectAll = document.getElementsByClassName("select-all")[0];

    return {

        init: function() {
            for(let i=1;i<=PAGE_COUNT;i++) {
                optionsList[i].onclick = (() => changePage(i));
            }
            selectAll.onclick = (() => selectAllTask());
            optionsList[CLEAR_COMPLETED_TASK].onclick = (() => removeCompletedTask());
        },

        updateOptionsVisibility: function() {
            if(listController.getTaskCount()===0)
                options.style.display = 'none';
            else
                options.style.display = 'flex';
        },

        updateSelectAllDisplay: function() {
            if(listController.getTaskCount()==0)
                selectAll.style.visibility = "hidden";
            else
                selectAll.style.visibility = "visible";

            if(listController.isIncompletePresent()===false)
                selectAll.classList.add("active-select-all");
            else
                selectAll.classList.remove("active-select-all");
        },

        updateTaskCount: function() {
            optionsList[TASK_COUNT].innerHTML = listController.getActiveTaskCount() + " item left";
        },

        updateCurrentPageDisplay: function() {
            for(var i=1;i<=PAGE_COUNT;i++) {
                optionsList[i].classList.remove('active-option');
                optionsList[i].classList.add('inactive-options');
            }

            optionsList[listController.getCurrentPage()].classList.add('active-option');
            optionsList[listController.getCurrentPage()].classList.remove('inactive-options');
        },

        updateClearCompletedTaskDisplay: function() {
            if(listController.isCompletePresent()===false)
                optionsList[CLEAR_COMPLETED_TASK].style.visibility = 'hidden';
            else
                optionsList[CLEAR_COMPLETED_TASK].style.visibility = 'visible';
        },

        updateShadow: function() {
            if(listController.getTaskCount()!==0)
                document.getElementsByClassName("list-container")[0].classList.add("box-shadow");
            else
                document.getElementsByClassName("list-container")[0].classList.remove("box-shadow");
        },

        updateOptions: function() {

            this.updateOptionsVisibility();

            this.updateSelectAllDisplay();
            this.updateTaskCount();
            this.updateCurrentPageDisplay();
            this.updateClearCompletedTaskDisplay();
            
            this.updateShadow();
        }
    };
}());





// Display Controller ------------------------------------------------------------------------------------------------//

var displayController = (function(){

    const DISPLAY_ALL_TASK = 1;
    const DISPLAY_ACTIVE_TASK = 2;
    const DISPLAY_COMPLETED_TASK = 3;
    
    var inputText = document.getElementsByClassName("input-text")[0];
    var todoList = document.getElementsByClassName("task-list")[0];

    function encodeHTML(s) {
        return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;').split("'").join('&#39;');
    }

    function createTaskHtmlDiv(taskPosition) {

        var task = listController.getTask(taskPosition);

        if(isUndefinedOrNull(task)===true)
            return;

        var div = document.createElement('div');
        div.classList.add("task-container");
        if(task.complete)
        div.classList.add("complete-task-container");

        div.innerHTML =     `<div class="default-cursor checkbox" onclick="displayController.toggleTask(${taskPosition})">✔</div>
                            <div class="task-display-input-div" ondblclick="displayController.enableInput(${taskPosition})">${encodeHTML(task.text)}</div>
                            <p class="default-cursor" onclick="displayController.deleteTask(${taskPosition})"> X </p>`;
        return div;
    }

    function createTaskHtmlInput(taskPosition) {

        var task = listController.getTask(taskPosition);

        if(isUndefinedOrNull(task)===true)
            return;

        var div = document.createElement('div');
        div.classList.add("task-container");
        if(task.complete)
        div.classList.add("complete-task-container");

        div.innerHTML = `<div class="default-cursor checkbox" onclick="displayController.toggleTask(${taskPosition})">✔</div>
                        <input class="input-text" value="${encodeHTML(task.text)}" onfocusout="displayController.disableInput(${taskPosition})"/>
                        <p class="default-cursor" onclick="displayController.deleteTask(${taskPosition})"> X </p>`;
        return div;
    }

    return {

        resetDisplay: function() {
            todoList.innerHTML = "";
        },

        hideTask: function(taskPosition) {
            var content = todoList.getElementsByClassName("task-container")[taskPosition];
            if(isUndefinedOrNull(content)===false)
                content.style.display = 'none';
        },

        visibleTask: function(taskPosition) {
            var content = todoList.getElementsByClassName("task-container")[taskPosition];
            if(isUndefinedOrNull(content)===false)
                content.style.display = 'flex';
        },

        updateTaskDisplay: function(taskPosition) {
            var currentPage = listController.getCurrentPage();
            var task = listController.getTask(taskPosition);

            if(isUndefinedOrNull(task)===true || (currentPage===DISPLAY_ACTIVE_TASK && task.complete===true) || (currentPage===DISPLAY_COMPLETED_TASK && task.complete===false))
                this.hideTask(taskPosition);
            else
                this.visibleTask(taskPosition);
        },

        appendTaskToDisplay: function(taskPosition) {
            todoList.appendChild(createTaskHtmlDiv(taskPosition));
            this.updateTaskDisplay(taskPosition);
            optionsController.updateOptions();
        },

        createTask: function(){
            var text = inputText.value.trim();

            if(text==false)
                return;
            else
                inputText.value = "";

            listController.addTask({text:text, complete:false});
            this.appendTaskToDisplay(listController.getLength()-1);
        },

        updateTask: function(taskPosition) {
            var taskContent = todoList.getElementsByClassName('task-container')[taskPosition];
            var text = taskContent.getElementsByClassName("input-text")[0].value.trim();

            if(text==false) {
                this.deleteTask(taskPosition);
                return;
            }

            listController.updateTask(taskPosition,text);
        },

        deleteTask: function (taskPosition) {
            listController.deleteTask(taskPosition);
            this.updateTaskDisplay(taskPosition);
            optionsController.updateOptions();
        },

        toggleTask: function(taskPosition){

            var taskContent = todoList.getElementsByClassName('task-container')[taskPosition];
            var task = listController.getTask(taskPosition);

            if(task.complete===true) {
                listController.markTaskAsIncomplete(taskPosition);
                taskContent.classList.remove('complete-task-container');
            } else {
                listController.markTaskAsComplete(taskPosition);
                taskContent.classList.add('complete-task-container');
            }

            this.updateTaskDisplay(taskPosition);
            optionsController.updateOptions();
        },

        enableInput: function(taskPosition) {
            todoList.replaceChild(createTaskHtmlInput(taskPosition),todoList.childNodes[taskPosition]);

            var ttaskText = todoList.getElementsByClassName('task-container')[taskPosition].getElementsByClassName('input-text')[0];
            ttaskText.focus();
            var temp = ttaskText.value;
            ttaskText.value = "";
            ttaskText.value = temp;
        },

        disableInput: function(taskPosition) {
            this.updateTask(taskPosition);
            todoList.replaceChild(createTaskHtmlDiv(taskPosition),todoList.childNodes[taskPosition]);
        }
    }
}());





// main functions ------------------------------------------------------------------------------------------------//

function init() {
    document.getElementsByClassName("input-text")[0].onchange = (() => displayController.createTask());
    optionsController.init();

    fetchData();
}

function isUndefinedOrNull(x) {
    if(x===undefined || x===null)
        return true;
    else
        return false;
}

function changePage(PagePosition) {
    listController.setCurrentPage(PagePosition);

    for(var i=0;i<listController.getLength();i++)
        if(isUndefinedOrNull(listController.getTask(i))===false)
            displayController.updateTaskDisplay(i);

    optionsController.updateOptions();
}

function selectAllTask() {
    if(listController.isIncompletePresent()) {
        for(var i=0;i<listController.getLength();i++) {
            if(isUndefinedOrNull(listController.getTask(i)!=null)===false && listController.getTask(i).complete===false)
                displayController.toggleTask(i);
        }
    } else {
        for(var i=0;i<listController.getLength();i++) {
            if(listController.getTask(i)!=null)
                displayController.toggleTask(i);
        }
    }
}

function removeCompletedTask() {
    for(var i=0;i<listController.getLength();i++) {
        if(isUndefinedOrNull(listController.getTask(i))===false && listController.getTask(i).complete===true)
            displayController.deleteTask(i);
    }
}



// Helper Function ---------------------------------------------------------------------------------------------------//

init();

document.addEventListener("visibilitychange", function() {
    if (document.hidden){
        saveData();
    } else {
        fetchData();
    }
});

function fetchData() {

    var taskListLength = localStorage.getItem('taskListLength');
    if(isUndefinedOrNull(taskListLength))
        taskListLength=0;

    listController.clearList();
    for(var i=0;i<taskListLength;i++)
        listController.addTask(JSON.parse(localStorage.getItem('task'+i)));

    var currentPage = localStorage.getItem('currentPagePosition');
    listController.setCurrentPage(currentPage);

    displayController.resetDisplay();
    for(var i=0;i<listController.getLength();i++) 
    displayController.appendTaskToDisplay(i);
    changePage(listController.getCurrentPage());
}

function saveData() {
    listController.makeDenseList();

    localStorage.setItem('currentPagePosition',listController.getCurrentPage().toString());
    localStorage.setItem('taskListLength',listController.getLength().toString());

    var taskListLength = listController.getLength();
    for(var i=0;i<taskListLength;i++)
    localStorage.setItem('task'+i,JSON.stringify(listController.getTask(i)));
}