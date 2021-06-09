import {AureliaForm} from '../../aurelia-form';
// import {errorHandler} from '../../../../utility/utility';

export class ExampleAddRowForm extends AureliaForm {
  constructor() {
    super();

    this.focus = 'ssn';

    this.formId = 'formDiv';

    // set in activate
    this.context;
    this.record;
    this.purpose;
    this.gridOptions;

    this.inputFields = [
      {id: 'ssn', customName: 'SSN'},
      {id: 'status', customName: 'Status'},
      {id: 'relationship', customName: 'Relationship'},
      {id: 'first_name', customName: 'First Name'},
      {id: 'last_name', customName: 'Last Name'},
      {id: 'dob', customName: 'DOB'},
    ];

    this.requiredFields = [
      'ssn',
      'relationship',
      'first_name',
      'last_name',
      'dob'
    ];

    this.preFilledFields = [
      {input: 'relationship', value: 'Employee'}
    ];

    this.disableFields = [
      'relationship'
    ];
  }

  activate(params) {
    this.routeContext = params;
    this.record = params.record;
    this.purpose = params.purpose;
    this.gridOptions = params.gridOptions;
  }

  attached() {
    this.setupForm();
  }

  getFormInputsFunc() {
    return Array.from(document.getElementsByClassName('a_input'));
  }

  async submitFunc() {
    const addRowWithData = async (data) => {
      try {
        const response = await this.routeContext.dataLoader.httpFetch({
          prefix: 'api/',
          endpoint: 'addRowWithData',
          payload: {
            changeLog: false,
            data: {
              data: data,
              gridName: 'example_table'
            }
          }
        });

        return response;
      } catch (err) {
        console.log(err);
        // return errorHandler({err: err, context: 'addRowWithData'});
      }
    };

    const data = {};

    const inputList = this.getFormInputsFunc();
    for (let i = 0; i < inputList.length; i++) {
      if (inputList[i].value !== '') {
        data[inputList[i].id] = inputList[i].value;
      }
    }

    data['no'] = this.routeContext.adminState.no;

    await addRowWithData(data);
  };
}