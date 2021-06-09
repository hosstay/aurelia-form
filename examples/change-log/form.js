import {AureliaForm} from '../../aurelia-form';
import {useShadowDOM} from 'aurelia-framework'; 
/* SHADOWDOM WORKAROUND: Needed so that switching between compose tags doesn't maintain old css. 
                         Doesn't seem to work all the time, would recommend just naming css different
*/

@useShadowDOM
export class ChangeLogForm extends AureliaForm {
  constructor() {
    super();

    this.formId = 'formDiv';

    // set in activate
    this.context;
    this.record;
    this.purpose;
    this.gridOptions;

    this.inputFields = [];
  }

  activate(params) {
    this.routeContext = params;
    this.purpose = params.purpose;
    this.gridOptions = params.gridOptions;

    const lines = [];
    const changes = params.record.changes.split('\n');
    changes.splice(-1, 1);

    this.record = {};

    changes.forEach((change) => {
      const key = change.match(/(.*):/)[1];
      const oldKey = `old_${key}`;
      const newKey = `new_${key}`;
      const oldValue = change.match(/: (.*) =>/)[1];
      const newValue = change.match(/=> (.*)$/)[1];

      lines.push({key: key, oldKey: oldKey, newKey: newKey});

      // create record that will provide values for input boxes
      this.record[oldKey] = oldValue;
      this.record[newKey] = newValue;
    });

    this.inputFields = lines;
  }

  attached() {
    this.setupForm();
  }

  getFormInputsFunc() {
    return Array.from(document.getElementsByClassName('a_input'));
  }
}