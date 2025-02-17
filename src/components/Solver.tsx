import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { TimetableOutput } from '../core/timetable_to_smtlib2';
import { Link } from 'react-router-dom';
import {
    Button,
    Accordion,
    Message,
    Container,
    Divider,
    Grid,
    Loader,
    Dimmer,
    Checkbox,
    Tab,
} from 'semantic-ui-react';
import {
    GenericTimetable,
    GlobalConstraintsList,
    defaultConstraints,
} from '../core/generic_timetable';
import { Z3Manager, Z3Callbacks } from '../core/z3_manager';
import { NUSModsFrontend, ModuleToAdd } from '../frontends/nusmods_frontend';
import { ConstraintModule } from './ModuleConstraints';
import './Solver.css';
//@ts-ignore
const CodeDisplay = React.lazy(() => import('./CodeDisplay'));
const GlobalConstraints = React.lazy(() => import('./GlobalConstraints'));
const ModuleConstraints = React.lazy(() => import('./ModuleConstraints'));

enum Z3State {
    PRE_INIT = 0,
    INITIALIZED = 1,
    SOLVING = 2,
}

export const Solver: React.FC<{ onNewTimetable(timetable: any): any }> = ({ onNewTimetable }) => {
    let [smtlibInput, setSmtlibInput] = useState<string>('No input yet.');
    let [smtlibOutput, setSmtlibOutput] = useState<string>('No output yet.');
    let [shouldShowHelp, setShouldShowHelp] = useState<boolean>(true);
    let [modules, setModules] = useState<Array<ConstraintModule>>([]);
    let [z3State, setZ3State] = useState<Z3State>(Z3State.PRE_INIT);
    let [constraints, setConstraints] = useState<GlobalConstraintsList>(defaultConstraints);
    let [debugOpen, setDebugOpen] = useState<boolean>(false);

    const callbacks: Z3Callbacks = useMemo(() => {
        function onZ3Initialized() {
            setZ3State(Z3State.INITIALIZED);
        }

        function updateInputSmtlib2(smtStr: string) {
            setSmtlibInput(smtStr);
        }

        function onOutput(smtStr: string) {
            setSmtlibOutput(smtStr);
        }

        function onTimetableOutput(timetable: TimetableOutput) {
            // setSmtlibOutput(smtStr)
            console.log(timetable);
            setZ3State(Z3State.INITIALIZED);
            onNewTimetable(timetable);
        }
        return {
            onZ3Initialized: onZ3Initialized,
            onSmtlib2InputCreated: updateInputSmtlib2,
            onOutput: onOutput,
            onTimetableOutput: onTimetableOutput,
        };
    }, [onNewTimetable]);

    // Runs once to init the z3 module
    useEffect(() => {
        Z3Manager.initZ3(callbacks);
    }, [callbacks]);

    // Runs on button pressed
    function onSubmit() {
        console.log('Initializing z3 worker');
        // console.log(worker)
        let nusmods_fe = new NUSModsFrontend();

        const modules_to_add: Array<ModuleToAdd> = modules.map((mod: ConstraintModule) => {
            return {
                module_code: mod.module_code,
                acad_year: mod.acad_year,
                semester: mod.semester,
                is_compulsory: mod.required,
                lessonConstraints: mod.lessonConstraints,
            };
        });
        nusmods_fe.add_modules(modules_to_add).then(() => {
            console.log(nusmods_fe);
            const gt: GenericTimetable = nusmods_fe.create_timetable(constraints);
            Z3Manager.loadTimetable(gt);
            setZ3State(Z3State.SOLVING);
            Z3Manager.solve();
        });
    }

    function onModulesChange(mods: Array<ConstraintModule>) {
        console.log(`onModulesChange: ${mods}`);
        setShouldShowHelp(false);
        setModules(mods);
    }

    return (
        <div className="solver">
            <Container>
                {z3State === Z3State.PRE_INIT && (
                    <Dimmer active page>
                        <Loader
                            indeterminate
                            content="Optimizer Initializing... (this can take one or two minutes)"
                        />
                    </Dimmer>
                )}
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Tab
                                panes={[
                                    {
                                        menuItem: 'Modules',
                                        render: () => (
                                            <Tab.Pane>
                                                <Suspense
                                                    fallback={
                                                        <div>
                                                            <strong>
                                                                Loading Module Selector...
                                                            </strong>
                                                        </div>
                                                    }
                                                >
                                                    <ModuleConstraints
                                                        modules={modules}
                                                        onModulesChange={onModulesChange}
                                                    />
                                                </Suspense>
                                            </Tab.Pane>
                                        ),
                                    },
                                    {
                                        menuItem: 'Constraints',
                                        render: () => (
                                            <Tab.Pane>
                                                <Suspense
                                                    fallback={
                                                        <div>
                                                            <strong>Loading Constraints...</strong>
                                                        </div>
                                                    }
                                                >
                                                    <GlobalConstraints
                                                        constraints={constraints}
                                                        onUpdateConstraints={setConstraints}
                                                        numberOfModules={modules.length}
                                                    />
                                                </Suspense>
                                            </Tab.Pane>
                                        ),
                                    },
                                ]}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            {modules.length === 0 && shouldShowHelp && (
                                <Message info>
                                    <Message.Header>Not sure what to do?</Message.Header>
                                    <p>
                                        <Link to="/how">
                                            Click here to go to "How To Use" section
                                        </Link>
                                    </p>
                                </Message>
                            )}
                            <Button
                                onClick={onSubmit}
                                disabled={modules.length === 0}
                                loading={z3State === Z3State.SOLVING}
                                primary
                                fluid
                                size="big"
                            >
                                Run Optimizer
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>

            <Divider />

            <Container>
                <Checkbox
                    toggle
                    checked={debugOpen}
                    onClick={() => setDebugOpen(!debugOpen)}
                    label="Behind-The-Scenes Optimizer Info"
                />
            </Container>

            <Accordion>
                <Accordion.Title active={debugOpen} index={0}>
                    &nbsp;
                </Accordion.Title>
                <Accordion.Content active={debugOpen}>
                    <Container>
                        <Suspense fallback={<div>Loading...</div>}>
                            <CodeDisplay
                                code={smtlibInput}
                                theme="dark"
                                headerText="Optimizer SMTLIB2 Input (Debug)"
                            />
                        </Suspense>
                    </Container>

                    <Divider />

                    <Container>
                        <Suspense fallback={<div>Loading...</div>}>
                            <CodeDisplay
                                code={smtlibOutput}
                                theme="light"
                                headerText="Optimizer SMTLIB2 Output (Debug)"
                            />
                        </Suspense>
                    </Container>
                </Accordion.Content>
            </Accordion>
        </div>
    );
};
