import React, { useState, useEffect } from 'react';
import {
    Segment,
    Button,
    Container,
    Divider,
    Grid,
    Loader,
    Dimmer,
    Header,
} from 'semantic-ui-react';
import logo from './logo.svg';
// import './App.css';
// import 'semantic-ui-less/semantic.less'

export const HowToUse: React.FC = () => {
    return (
        <Container text textAlign="justified">
            <Segment raised>
                <Header as="h2" textAlign="center">
                    {' '}
                    Using the NUS Timetable Optimizer{' '}
                </Header>

                <Header as="h3" textAlign="left">
                    {' '}
                    Purpose{' '}
                </Header>

                <p>
                    {' '}
                    This Optimizer helps you find an ideal timetable from a list of NUS modules that
                    you enter, based on a set of constraints that you can specify.{' '}
                </p>
                <p>
                    {' '}
                    For instance, it can help you arrange your timetable to find{' '}
                    <strong>free days</strong>, or start your days{' '}
                    <strong> no earlier than 10 am </strong>, select only enough modules to fit your
                    modular-credit requirements, and other possibilities.
                </p>

                <Header as="h3" textAlign="left">
                    {' '}
                    Step 1: Selecting Modules{' '}
                </Header>
                <ul>
                    <li>
                        {' '}
                        The Optimizer will download itself and begin the initialization process.{' '}
                    </li>
                    <li>
                        {' '}
                        During and after this process, you can use the{' '}
                        <strong>Module Selector</strong> to add the modules you would like to
                        eventually create an optimized timetable for.{' '}
                    </li>
                    <li>
                        {' '}
                        The Optimizer is not a module planner, so you can use something like{' '}
                        <a href="https://nusmods.com" target="_blank" rel="noreferrer">
                            NUSMods
                        </a>{' '}
                        to browse for your modules first.{' '}
                    </li>

                    <li>
                        {' '}
                        Modules can be set as <strong> "Compulsory" </strong> or{' '}
                        <strong> "Optional" </strong>. A "Compulsory" module must be present in the
                        final timetable, whereas an "Optional" module may be dropped if other
                        constraints are violated.{' '}
                    </li>
                </ul>

                <Header as="h3" textAlign="left">
                    {' '}
                    Step 2: Selecting Constraints{' '}
                </Header>
                <ul>
                    <li>
                        {' '}
                        After selecting all the modules you are interested in, you can use the{' '}
                        <strong> Constraints </strong> region to set requirements for your generated
                        timetable.{' '}
                    </li>
                    <li>
                        {' '}
                        For instance, the "Earliest Lesson Start/End" constraints ensure that no
                        module starts or ends after a certain time.{' '}
                    </li>
                    <ul>
                        <li>
                            {' '}
                            Note: you must <strong> activate the constraint </strong> (click on the
                            "No" button to make it "Yes") for it to be used in the optimizer{' '}
                        </li>
                    </ul>
                </ul>

                <Header as="h3" textAlign="left">
                    {' '}
                    Step 3: Running the Solver{' '}
                </Header>
                <ul>
                    <li>
                        {' '}
                        Once the modules are selected and the constraints are set, press the{' '}
                        <strong> Run Optimizer </strong> button to run the optimization procedure.{' '}
                    </li>
                    <li> This might take a few seconds. </li>
                    <li>
                        {' '}
                        If the optimization succeeds and there are no timetable clashes, the
                        timetable will update at the top of the screen{' '}
                    </li>
                    <li>
                        {' '}
                        If the optimization fails, there is no timetable configuration to meet your
                        constraints. An error message will appear over the timetable, and you will
                        have to change your modules or constraints{' '}
                    </li>
                </ul>

                <Header as="h3" textAlign="left">
                    {' '}
                    Step 4: Interpreting the Results{' '}
                </Header>
                <ul>
                    <li>
                        {' '}
                        The timetable will show you the modules that were selected and what
                        timeslots and class numbers (e.g., CS3203 Recitation "1") are ideal.{' '}
                    </li>
                    <li>
                        {' '}
                        If multiple timetable arrangements could have satisfied your constraints,
                        you can click "Run Optimizer" again to randomly generate a different
                        arrangement.{' '}
                    </li>
                    <li>
                        {' '}
                        Two or more slots may appear stacked on top of each other at the same time -
                        this indicates that the lessons are run on different weeks.{' '}
                    </li>
                    <li>
                        {' '}
                        You can use the optimized timetable generated by this webapp as a guide to
                        select your classes{' '}
                    </li>
                </ul>
            </Segment>
        </Container>
    );
};
