/*
  // Input Options //
    confirmChks            // 2 checkboxes are linked and both need to be checked for submit to be allowed
    customChks             // allows a custom function to run when checkbox is checked
    customFields           // runs given conversion function both for display in inputs and for extracting for database
    naChks                 // checking the checkbox disables the associated input and gives blank value
    preFilledFields        // on purpose 'new' pre fills fields in leiu of the standard loadDataIntoForm via this record
    requiredFields         // requires the user to fill out field to submit (places Required placeholder word in input and highlights in red when not filled out and submit is clicked)
    splitFields            // splits a field on a given separator and places the parts in destination inputs
    toggleChks             // checking one checkbox unchecks the second linked checkbox and visa versa
    toggleInputs           // the opposite of naChks. Checking the checkbox enables the associated input, unchecking it disables the input and gives blank value

  // Required Functions //
    getFormInputsFunc      // runs given function to get input node array
    submitFunc             // runs given function when submit button is clicked.

  // Optional Functions //
    onStartFunc            // runs given function at start, sends record as parameter
    onResetFormInputsFunc  // runs given function when reseting form inputs, sends record as parameter
    onLoadDataFunc         // runs given function when loading data into inputs, sends record as parameter
    onExitFunc             // runs given function when exiting the form.
*/

// import {errorHandler} from '../../utility/utility';
// import moment from 'moment';

export class AureliaForm {
  constructor() {
    this.toggleGroups = [];
    this.toggleInputGroups = [];

    this.focus = '';
    this.naChks = [];
    this.toggleChks = [];
    this.toggleInputs = [];
    this.confirmChks = [];
    this.customChks = [];
    this.customFields = [];
    this.splitFields = [];
    this.disableFields = [];
    this.disableException = [];
    this.requiredFields = [];
    this.preFilledFields = [];

    this.schema = [];
    this.inputs = [];
    this.record = {};

    this.handler;
  }

  exitForm(event) {
    const hideForm = () => {
      document.removeEventListener('keyup', this.handler);
      this.routeContext.form = 'none';
    };

    try {
      hideForm();

      if (this.routeContext.dblClickEventListener) {
        document.addEventListener('dblclick', this.routeContext.dblClickEventListener, true);
      }

      this.onExitFunc(event);
      this.enableAllInputs();
    } catch (err) {
      console.log(err);
      // return errorHandler({err: err, context: 'exitForm', isLast: true});
    }
  }

  async submitForm(event) {
    try {
      let stopSubmit = false;
      this.requiredFields.forEach((requiredField) => {
        if (document.getElementById(requiredField).value === '') {
          stopSubmit = true;
          document.getElementById(requiredField).style.borderColor = '#FF0000';
        }
      });

      if (!stopSubmit) {
        const result = await this.submitFunc(event);
        if (result === undefined) this.exitForm(event);
      }
    } catch (err) {
      console.log(err);
      // return errorHandler({err: err, context: 'submitForm', isLast: true});
    }
  }

  formKeyPressHandler(event) {
    const ENTER_KEY = 13;
    const ESC_KEY = 27;

    if (this.purpose !== 'view' && (event.which === ENTER_KEY || event.keyCode === ENTER_KEY)) {
      this.submitForm();
    } else if (event.which === ESC_KEY || event.keyCode === ESC_KEY) {
      this.exitForm();
    }
  }

  noInput(event) {
    let parentElement;

    this.naChks.forEach((naChk) => {
      if (naChk.chk === event.target.id) {
        parentElement = document.getElementById(naChk.input);
      }
    });

    if (event.target.checked === true) {
      parentElement.disabled = true;
      parentElement.value = '';
    } else {
      parentElement.disabled = false;
    }
  }

  resetFormInputs() {
    this.inputs.forEach((input) => {
      input.value = '';
      input.checked = false;
      input.disabled = false;
    });

    this.onResetFormInputsFunc(this.record);
  }

  disableAllInputs() {
    this.inputs.forEach((input) => {
      input.disabled = true;
    });

    this.disableException.forEach((exception) => {
      document.getElementById(exception).disabled = false;
    });
  }

  enableAllInputs() {
    this.inputs.forEach((input) => {
      input.disabled = false;
    });
  }

  disableSingleFields() {
    this.disableFields.forEach((field) => document.getElementById(`${field}`).disabled = true);
  }

  async loadDataIntoForm() {
    const setInput = (value, input) => {
      const isToggleChk = this.toggleGroups.findIndex((toggleChk) => toggleChk.includes(input.id));
      const naChkIndex = this.naChks.findIndex((naChk) => input.id === naChk.chk);
      const confirmChkIndex = this.confirmChks.findIndex((confirmChk) => input.id === confirmChk.confirm);

      if (isToggleChk !== -1) {
        if (confirmChkIndex !== -1) {
          const parentElement = document.getElementById(this.confirmChks[confirmChkIndex].input);
          if (parentElement.checked === true) {
            input.checked = true;
          }
        } else {
          if (value === 'true') {
            if (/^(yes)_/.test(input.id)) {
              input.checked = true;
            }
          } else {
            if (/^(no)_/.test(input.id)) {
              input.checked = true;
            }
          }
        }
      } else if (naChkIndex !== -1) {
        const parentElement = document.getElementById(this.naChks[naChkIndex].input);
        if (parentElement.value === '') {
          input.checked = true;
          parentElement.disabled = true;
        } else {
          parentElement.disabled = false;
        }
      } else {
        if (input.type === 'checkbox') {
          input.checked = value === 'true';
        } else {
          input.value = value;
        }
      }
    };

    const searchAndSetInput = (input) => {
      for (let i = 0; i < this.inputs.length; i++) {
        input[i].childNodes.forEach((child) => {
          if (child.firstElementChild && child.firstElementChild.id !== '') {
            setInput(this.record[child.firstElementChild.id], document.getElementById(child.firstElementChild.id));
          }
        });
      }
    };

    const splitInput = () => {
      for (let i = 0; i < this.splitFields.length; i++) {
        let recordValue = this.record[this.splitFields[i].field];

        // if (this.splitFields[i].date) {
        //   if (moment(recordValue, 'MM/DD/YYYY', true).isValid()) {
        //     recordValue = moment(recordValue, 'MM/DD/YYYY').format('MM/DD/YYYY');
        //   } else if (moment(recordValue, 'YYYY-MM-DD', true).isValid()) {
        //     recordValue = moment(recordValue, 'YYYY-MM-DD').format('MM/DD/YYYY');
        //   }
        // }

        if (recordValue) {
          if (this.splitFields[i].valueMods) {
            this.splitFields[i].valueMods.forEach((mod) => {
              recordValue = mod(recordValue);
            });
          }

          const fieldList = this.splitFields[i].destinationFields;
          const separator = this.splitFields[i].seperator;
          const splitValues = recordValue.split(separator);
          for (let j = 0; j < fieldList.length; j++) {
            document.getElementById(fieldList[j]).value = splitValues[j] ? splitValues[j] : '';
          }
        }
      }
    };

    // Parent inputs first (standard input)
    // Sets value if input is leaf, otherwise loops through children.
    this.inputs.forEach((input) => {
      if (input.type !== 'checkbox') {
        const key = input.id;
        if (key) {
          setInput(this.record[key], input);
        } else {
          // if m-input is a div class, search child nodes for input name
          searchAndSetInput(input);
        }
      }
    });

    // Child inputs after (type checkbox)
    // Sets value if input is leaf, otherwise loops through children.
    this.inputs.forEach((input) => {
      const isConfirmChk = this.confirmChks.findIndex((confirmChk) => input.id === confirmChk.confirm) !== -1;
      if (input.type === 'checkbox' && !isConfirmChk) {
        let key = input.id;

        // If toggle checks is using the multiple chks to one column option
        // change key to actual column name.
        const isToggleChk = this.toggleGroups.findIndex((group) => group.includes(input.id)) !== -1;
        if (this.toggleChks[0] && !Array.isArray(this.toggleChks[0]) && isToggleChk) {
          key = this.toggleChks[this.toggleGroups.findIndex((group) => group.includes(input.id))].column;
        }

        if (key) {
          setInput(this.record[key], input);
        } else {
          // if m-input is a div class, search child nodes for input name
          searchAndSetInput(input);
        }
      }
    });

    // Do confirmChks after normal chks so they can see the parent chks state to decide their own.
    this.inputs.forEach((input) => {
      const isConfirmChk = this.confirmChks.findIndex((confirmChk) => input.id === confirmChk.confirm) !== -1;
      if (input.type === 'checkbox' && isConfirmChk) {
        const key = input.id;

        if (key) {
          setInput(this.record[key], input);
        } else {
          // if m-input is a div class, search child nodes for input name
          searchAndSetInput(input);
        }
      }
    });

    this.onLoadDataFunc(this.record);

    this.customChks.forEach((chk) => {
      if (chk.load) {
        chk.load();
      }
    });

    this.customFields.forEach((customField) => {
      document.getElementById(customField.id).value = customField.conversionFunc(this.record[customField.id], true);
    });

    this.preFilledFields.forEach((preFilledField) => {
      document.getElementById(preFilledField.input).value = preFilledField.value;
    });

    splitInput();
  }

  toggleChkHandler(event) {
    const groupIndex = this.toggleChks.findIndex((toggleGroup) => toggleGroup.chks.includes(event.target.id));

    // if the toggleGroup is found, disable all other checkboxes
    if (groupIndex !== -1) {
      this.toggleGroups[groupIndex].forEach((chk) => {
        if (event.target.id !== chk) {
          document.getElementById(chk).checked = false;
        }
      });
    }
  }

  toggleInputHandler(event) {
    let parentElement;

    this.toggleInputs.forEach((toggleInput) => {
      if (toggleInput.chk === event.target.id) {
        parentElement = document.getElementById(toggleInput.input);
      }
    });

    if (event.target.checked === true) {
      parentElement.disabled = false;
    } else {
      parentElement.disabled = true;
      parentElement.value = '';
    }
  }

  getDataSchemaFunc() {
    // overwritten if used
  }

  onStartFunc() {
    // overwritten if used
  }

  onLoadDataFunc() {
    // overwritten if used
  }

  onResetFormInputsFunc() {
    // overwritten if used
  }

  onExitFunc() {
    // overwritten if used
  }

  submitFunc() {
    // overwritten if used
  }

  async setupForm() {
    const addOptionalChks = () => {
      const addCustomChks = () => {
        this.customChks.forEach((customChk) => {
          if (customChk.purpose.includes(this.purpose)) {
            document.getElementById(customChk.chk).addEventListener('click', customChk.func);
          }
        });
      };

      const addNaChks = () => {
        this.naChks.forEach((naChk) => {
          document.getElementById(naChk.chk).addEventListener('click', this.noInput.bind(this));
        });
      };

      const addToggleChks = () => {
        this.toggleChks.forEach((group) => {
          if (Array.isArray(group)) {
            this.toggleGroups.push(group);
          } else {
            this.toggleGroups.push(group.chks);
          }
        });

        this.toggleChks.forEach((element) => {
          element.chks.forEach((chk) => {
            document.getElementById(chk).addEventListener('click', this.toggleChkHandler.bind(this));
          });
        });
      };

      const addToggleInputs = () => {
        this.toggleInputs.forEach((toggleInput) => {
          document.getElementById(toggleInput.chk).addEventListener('change', this.toggleInputHandler.bind(this));
        });
      };

      addCustomChks();

      if (this.purpose === 'edit' || this.purpose === 'new') {
        addNaChks();
        addToggleChks();
        addToggleInputs();
      }
    };

    const setupEventListeners = () => {
      if (this.purpose === 'edit' || this.purpose === 'new') {
        if (this.submitButton) {
          this.submitButton.addEventListener('click', this.submitForm.bind(this));
        }
      }

      this.handler = (event) => {
        this.formKeyPressHandler(event);
      };
      document.addEventListener('keyup', this.handler);

      if (this.exitButton) {
        this.exitButton.addEventListener('click', this.exitForm.bind(this));
      }

      // if event listener is not removed, user is able to double click and
      // open up a new form while one is already open.
      document.removeEventListener('dblclick', this.routeContext.dblClickEventListener, true);
    };

    try {
      this.inputs = this.getFormInputsFunc();
      if (this.inputs.length < 1) throw 'No Inputs';

      this.submitButton = document.getElementById(this.submitButtonId ? this.submitButtonId : 'bodyFooterSubmit');
      this.exitButton = document.getElementById(this.exitButtonId ? this.exitButtonId : 'formExitButton');
      this.formElement = document.getElementById(this.formId ? this.formId : 'formDiv');

      addOptionalChks();
      setupEventListeners();
      this.resetFormInputs();

      if (!this.formElement) throw 'No Form';
      this.formElement.style.display = 'block';

      this.requiredFields.forEach((requiredField) => {
        document.getElementById(requiredField).placeholder = 'Required';
      });

      if (this.purpose === 'edit' || this.purpose === 'view') {
        this.loadDataIntoForm();
      } else {
        this.preFilledFields.forEach((preFilledField) => {
          document.getElementById(preFilledField.input).value = preFilledField.value;
        });
      }

      this.schema = await this.getDataSchemaFunc();

      this.onStartFunc(this.record);

      if (this.purpose === 'view') {
        if (this.submitButton) {
          this.submitButton.style.display = 'none';
        }
        this.disableAllInputs();
      }

      if (this.focus !== '') {
        document.getElementById(this.focus).focus();
      }

      this.disableSingleFields();
    } catch (err) {
      console.log(err);
      // return errorHandler({err: err, context: 'setupForm', isLast: true});
    }
  }
}