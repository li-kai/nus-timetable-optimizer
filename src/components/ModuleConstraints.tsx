import React, { useState } from 'react';
import './Solver.css';
import {
    Button,
    Grid,
    Icon,
    Modal,
    Input,
    Form,
    Select,
    Header,
    Message,
    Transition,
    Table,
} from 'semantic-ui-react';
import { NUSModsFrontend } from '../frontends/nusmods_frontend';
import { getRandomColorFromString } from '../util/utils';
import ModuleSlotSelector, { LessonTypeConstraints } from './ModuleSlotSelector';
import { Media } from './Responsive';
interface ModuleConstraintsProps {
    modules: Array<ConstraintModule>;
    onModulesChange(mods: Array<ConstraintModule>): any;
}

export interface ConstraintModule {
    module_code: string;
    acad_year: string;
    semester: number;
    json?: any;
    required: boolean;
    lessonConstraints?: LessonTypeConstraints; // JSON after constraints have
}

/**
 * Responsible for setting constraints individually for all selected modules.
 * Also contains a selector (combined here to keep state contained) for the modules
 * */
const ModuleConstraints: React.FC<ModuleConstraintsProps> = ({ modules, onModulesChange }) => {
    let ay_xs: Array<any> = [{ key: 1, text: '2020-2021', value: 1 }];
    let sem_xs: Array<any> = [
        { key: 1, text: '1', value: 1 },
        { key: 2, text: '2', value: 2 },
    ];
    const defaultAyValue = 1;
    const defaultSemValue = 1;

    let [moduleText, setModuleText] = useState('');
    let [ayValue, setAyText] = useState(defaultAyValue);
    let [semValue, setSemText] = useState(defaultSemValue);
    let [showModuleAddError, setShowModuleAddError] = useState(false);
    let [activeErrorCancelTimeout, setActiveErrorCancelTimeout] = useState<any>(undefined);
    let [open, setOpen] = useState(false);
    let [open2, setOpen2] = useState(false);
    let [openSlotSelector, setOpenSlotSelector] = useState(false);
    let [selectedMod, setSelectedMod] = useState<ConstraintModule | undefined>(undefined);

    /*
     * Try to add a module to the current list of modules
     */
    function handleClick() {
        const ay = ay_xs.find(x => x.value == ayValue);
        const sem = sem_xs.find(x => x.value == semValue);
        console.log(`${moduleText} - ${ay.text} - ${sem.text}`);
        let mod: ConstraintModule = {
            module_code: moduleText.toUpperCase(),
            acad_year: ay.text,
            semester: semValue,
            required: true,
        };

        const containsModAlready: boolean = modules.some(
            (m: ConstraintModule) => m.module_code === mod.module_code
        );
        if (containsModAlready) {
            console.log("Couldn't add module, exists already");
            setShowModuleAddError(true);
            cancelErrorAfterInterval();
            return;
        }

        NUSModsFrontend.read_module_json(mod.module_code, mod.acad_year, mod.semester).then(
            (moduleJson: any) => {
                console.log(moduleJson);
                if (Object.keys(moduleJson).length === 0) {
                    console.log("Couldn't add module!");
                    setShowModuleAddError(true);
                    cancelErrorAfterInterval();
                } else {
                    mod.json = moduleJson;
                    const data = mod.json;
                    const semdata = data['semesterData'].find(
                        (v: any) => v.semester === mod.semester
                    );
                    const timetable = semdata['timetable'];
                    // If any lesson doesn't have a weeks array, show the modal
                    if (timetable.some((lesson: any) => !Array.isArray(lesson.weeks))) {
                        setOpen(true);
                        let mods = modules.concat(mod);
                        onModulesChange(mods);
                    } else if (modules.length > 0 && mod.semester !== modules[0].semester) {
                        console.log('Diff sem');
                        // Our new module is from a different semester than the rest
                        setOpen2(true);
                        let mods = modules.concat(mod);
                        onModulesChange(mods);
                    } else {
                        console.log('Successfully added module!');
                        setShowModuleAddError(false);
                        let mods = modules.concat(mod);
                        onModulesChange(mods);
                    }
                }
            }
        );
    }

    function removeLatestModuleAndClose() {
        let mods = modules.slice(0, -1);
        setOpen(false);
        setOpen2(false);
        onModulesChange(mods);
    }

    function cancelErrorAfterInterval() {
        if (activeErrorCancelTimeout !== undefined) clearTimeout(activeErrorCancelTimeout);
        let t = setTimeout(() => {
            setShowModuleAddError(false);
        }, 3000);
        setActiveErrorCancelTimeout(t);
    }

    function toggleRequired(mod: ConstraintModule) {
        const mods = modules.map((m: ConstraintModule) => {
            if (m !== mod) {
                return m;
            } else {
                m.required = !m.required;
                return m;
            }
        });
        onModulesChange(mods);
    }

    function removeModule(mod: ConstraintModule) {
        let newmods = modules.filter(m => m !== mod);
        onModulesChange(newmods);
    }

    function manualSelect(mod: ConstraintModule) {
        setSelectedMod(mod);
        setOpenSlotSelector(true);
    }

    function updateOpenSlotSelector() {
        setOpenSlotSelector(false);
    }

    function updateModuleSlotSelections(selections: LessonTypeConstraints) {
        const mods = modules.map((m: ConstraintModule) => {
            if (m !== selectedMod) {
                return m;
            } else {
                if (selections === undefined || Object.keys(selections).length === 0) {
                    m.lessonConstraints = undefined;
                } else {
                    m.lessonConstraints = selections;
                }
                return m;
            }
        });
        onModulesChange(mods);
    }

    // { /* Display error messages */}
    // <Grid.Row>

    // </Grid.Row>

    return (
        <div>
            <Header as="h3" textAlign="center">
                {' '}
                Module Selector{' '}
            </Header>

            {/* Display module selector */}
            <Form>
                <Form.Group>
                    <Form.Field
                        id="form-input-module-name"
                        control={Input}
                        label="Module Code"
                        placeholder="(e.g., CS3230)"
                        onChange={(e: any) => setModuleText(e.target.value)}
                        fluid
                        width={5}
                    />
                    <Form.Field
                        control={Select}
                        options={ay_xs}
                        defaultValue={defaultAyValue}
                        label="Academic Year"
                        onChange={(_: any, { value }: any) => setAyText(value as number)}
                        width={4}
                        fluid
                    />
                    <Form.Field
                        control={Select}
                        options={sem_xs}
                        defaultValue={defaultSemValue}
                        label="Semester"
                        onChange={(_: any, { value }: any) => setSemText(value as number)}
                        width={3}
                        fluid
                    />
                    <Form.Field
                        id="form-button-control-public"
                        control={Button}
                        content="Add Module"
                        primary
                        onClick={handleClick}
                        label="&nbsp;"
                        fluid
                        width={4}
                    />
                </Form.Group>
            </Form>

            <Transition visible={showModuleAddError} animation="fade" duration={1000}>
                <Message negative>
                    <Message.Header>
                        {"The module you specified doesn't exist or is already added."}
                    </Message.Header>
                    <p>
                        Please try another module or check the academic year / semester in NUSMods{' '}
                    </p>
                </Message>
            </Transition>

            {modules.length > 0 && (
                <Table compact>
                    <Media greaterThanOrEqual="md">
                        {(mediaClassNames, renderChildren) => {
                            return (
                                <Table.Header classNames={mediaClassNames}>
                                    {renderChildren ? (
                                        <Table.Row>
                                            <Table.HeaderCell>Module</Table.HeaderCell>
                                            <Table.HeaderCell width="5">Actions</Table.HeaderCell>
                                        </Table.Row>
                                    ) : null}
                                </Table.Header>
                            );
                        }}
                    </Media>

                    <Table.Body>
                        {/* <Transition.Group duration={1000}> */}
                        {modules.map((mod: ConstraintModule, idx: number) => {
                            let color = getRandomColorFromString(mod.module_code);
                            return (
                                <Table.Row>
                                    <Table.Cell>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: color,
                                                height: '1em',
                                                width: '1em',
                                                borderRadius: '0.125rem',
                                                marginRight: '0.5rem',
                                            }}
                                        />
                                        {mod.module_code + ' ' + mod.json['title']}{' '}
                                        <div style={{ fontSize: '0.875rem', color: 'grey' }}>
                                            {' '}
                                            {'AY ' +
                                                mod.acad_year +
                                                ' | Semester ' +
                                                mod.semester +
                                                ' | Workload: ' +
                                                mod.json['moduleCredit'] +
                                                ' MC ' +
                                                (mod.required ? '' : '| Optional')}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button basic onClick={() => toggleRequired(mod)}>
                                            Make {mod.required ? 'Optional' : 'Required'}
                                        </Button>
                                        <Button basic onClick={() => manualSelect(mod)}>
                                            Restrict Slots
                                        </Button>
                                        <Button basic icon onClick={() => removeModule(mod)}>
                                            <Icon name="delete" />
                                        </Button>
                                        <Message
                                            visible={mod.lessonConstraints !== undefined}
                                            hidden={mod.lessonConstraints === undefined}
                                            info
                                        >
                                            <p>
                                                {' '}
                                                You have restricted the possible slots for this
                                                module.{' '}
                                            </p>
                                        </Message>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                        {/* </Transition.Group> */}
                    </Table.Body>
                </Table>
            )}

            <Modal onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}>
                <Modal.Header>
                    The module you are adding does not follow the traditional NUS Academic Semester
                    Calendar.
                </Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <p>
                            Would you like to <strong>skip</strong> adding this module, or just{' '}
                            <strong>
                                assume that the module takes place every week this semester?
                            </strong>
                        </p>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Grid columns="equal">
                        <Grid.Column>
                            <Button fluid negative onClick={() => removeLatestModuleAndClose()}>
                                Skip
                            </Button>
                        </Grid.Column>
                        <Grid.Column>
                            <Button
                                content="Assume weekly"
                                fluid
                                onClick={() => setOpen(false)}
                                positive
                            />
                        </Grid.Column>
                    </Grid>
                </Modal.Actions>
            </Modal>

            <Modal onClose={() => setOpen2(false)} onOpen={() => setOpen2(true)} open={open2}>
                <Modal.Header>
                    The module you are adding is from a different semester than the rest of the
                    modules.
                </Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <p>
                            Would you like to <strong>skip</strong> adding this module, or{' '}
                            <strong>add it anyway?</strong>
                        </p>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Grid columns="equal">
                        <Grid.Column>
                            <Button fluid negative onClick={() => removeLatestModuleAndClose()}>
                                Skip
                            </Button>
                        </Grid.Column>
                        <Grid.Column>
                            <Button
                                content="Add anyway"
                                fluid
                                onClick={() => setOpen2(false)}
                                positive
                            />
                        </Grid.Column>
                    </Grid>
                </Modal.Actions>
            </Modal>

            <ModuleSlotSelector
                open={openSlotSelector}
                updateOpen={updateOpenSlotSelector}
                mod={selectedMod}
                updateModuleSlotSelections={updateModuleSlotSelections}
                initialSlotSelections={selectedMod?.lessonConstraints}
            />
        </div>
    );
};

export default ModuleConstraints;
