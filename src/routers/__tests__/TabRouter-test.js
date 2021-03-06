/* eslint react/display-name:0 */

import React from 'react';
import TabRouter from '../TabRouter';
import StackRouter from '../StackRouter';

import NavigationActions from '../../NavigationActions';

const INIT_ACTION = { type: NavigationActions.INIT };

const BareLeafRouteConfig = {
  screen: () => <div />,
};

describe('TabRouter', () => {
  test('Handles basic tab logic', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      Foo: { screen: ScreenA },
      Bar: { screen: ScreenB },
    });
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const expectedState = {
      index: 0,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
      isTransitioning: false,
    };
    expect(state).toEqual(expectedState);
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state
    );
    const expectedState2 = {
      index: 1,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
      isTransitioning: false,
    };
    expect(state2).toEqual(expectedState2);
    expect(router.getComponentForState(expectedState)).toEqual(ScreenA);
    expect(router.getComponentForState(expectedState2)).toEqual(ScreenB);
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state2
    );
    expect(state3).toEqual(null);
  });

  test('Handles getScreen', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      Foo: { getScreen: () => ScreenA },
      Bar: { getScreen: () => ScreenB },
    });
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const expectedState = {
      index: 0,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
      isTransitioning: false,
    };
    expect(state).toEqual(expectedState);
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state
    );
    const expectedState2 = {
      index: 1,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
      isTransitioning: false,
    };
    expect(state2).toEqual(expectedState2);
    expect(router.getComponentForState(expectedState)).toEqual(ScreenA);
    expect(router.getComponentForState(expectedState2)).toEqual(ScreenB);
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state2
    );
    expect(state3).toEqual(null);
  });

  test('Can set the initial tab', () => {
    const router = TabRouter(
      { Foo: BareLeafRouteConfig, Bar: BareLeafRouteConfig },
      { initialRouteName: 'Bar' }
    );
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    expect(state).toEqual({
      index: 1,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
      isTransitioning: false,
    });
  });

  test('Can set the initial params', () => {
    const router = TabRouter(
      { Foo: BareLeafRouteConfig, Bar: BareLeafRouteConfig },
      { initialRouteName: 'Bar', initialRouteParams: { name: 'Qux' } }
    );
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    expect(state).toEqual({
      index: 1,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        {
          key: 'Bar',
          routeName: 'Bar',
          hidden: false,
          params: { name: 'Qux' },
        },
      ],
      isTransitioning: false,
    });
  });

  test('Handles the SetParams action', () => {
    const router = TabRouter({
      Foo: {
        screen: () => <div />,
      },
      Bar: {
        screen: () => <div />,
      },
    });
    const state2 = router.getStateForAction({
      type: NavigationActions.SET_PARAMS,
      params: { name: 'Qux' },
      key: 'Foo',
    });
    expect(state2 && state2.routes[0].params).toEqual({ name: 'Qux' });
  });

  test('getStateForAction returns null when navigating to same tab', () => {
    const router = TabRouter(
      { Foo: BareLeafRouteConfig, Bar: BareLeafRouteConfig },
      { initialRouteName: 'Bar' }
    );
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state
    );
    expect(state2).toEqual(null);
  });

  test('getStateForAction returns initial navigate', () => {
    const router = TabRouter({
      Foo: BareLeafRouteConfig,
      Bar: BareLeafRouteConfig,
    });
    const state = router.getStateForAction({
      type: NavigationActions.NAVIGATE,
      routeName: 'Foo',
    });
    expect(state && state.index).toEqual(0);
  });

  test('Handles nested tabs and nested actions', () => {
    const ChildTabNavigator = () => <div />;
    ChildTabNavigator.router = TabRouter({
      Foo: BareLeafRouteConfig,
      Bar: BareLeafRouteConfig,
    });
    const router = TabRouter({
      Foo: BareLeafRouteConfig,
      Baz: { screen: ChildTabNavigator },
      Boo: BareLeafRouteConfig,
    });
    const params = { foo: '42' };
    const action = router.getActionForPathAndParams('Baz/Bar', params);
    const navAction = {
      type: NavigationActions.NAVIGATE,
      routeName: 'Baz',
      action: {
        type: NavigationActions.NAVIGATE,
        routeName: 'Bar',
        params: { foo: '42' },
      },
    };
    expect(action).toEqual(navAction);
    const state = router.getStateForAction(navAction);
    expect(state).toEqual({
      index: 1,
      isTransitioning: false,
      routes: [
        {
          key: 'Foo',
          routeName: 'Foo',
          hidden: false,
        },
        {
          index: 1,
          isTransitioning: false,
          key: 'Baz',
          routeName: 'Baz',
          hidden: false,
          routes: [
            {
              key: 'Foo',
              routeName: 'Foo',
              hidden: false,
            },
            {
              key: 'Bar',
              routeName: 'Bar',
              hidden: false,
              params,
            },
          ],
        },
        {
          key: 'Boo',
          routeName: 'Boo',
          hidden: false,
        },
      ],
    });
  });

  test('Handles passing params to nested tabs', () => {
    const ChildTabNavigator = () => <div />;
    ChildTabNavigator.router = TabRouter({
      Boo: BareLeafRouteConfig,
      Bar: BareLeafRouteConfig,
    });
    const router = TabRouter({
      Foo: BareLeafRouteConfig,
      Baz: { screen: ChildTabNavigator },
    });
    const navAction = {
      type: NavigationActions.NAVIGATE,
      routeName: 'Baz',
    };
    let state = router.getStateForAction(navAction);
    expect(state).toEqual({
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        {
          index: 0,
          key: 'Baz',
          routeName: 'Baz',
          isTransitioning: false,
          hidden: false,
          routes: [
            { key: 'Boo', routeName: 'Boo', hidden: false },
            { key: 'Bar', routeName: 'Bar', hidden: false },
          ],
        },
      ],
    });

    // Ensure that navigating back and forth doesn't overwrite
    state = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state
    );
    state = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Boo' },
      state
    );
    expect(state && state.routes[1]).toEqual({
      index: 0,
      isTransitioning: false,
      key: 'Baz',
      routeName: 'Baz',
      hidden: false,
      routes: [
        { key: 'Boo', routeName: 'Boo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
    });
  });

  test('Handles initial deep linking into nested tabs', () => {
    const ChildTabNavigator = () => <div />;
    ChildTabNavigator.router = TabRouter({
      Foo: BareLeafRouteConfig,
      Bar: BareLeafRouteConfig,
    });
    const router = TabRouter({
      Foo: BareLeafRouteConfig,
      Baz: { screen: ChildTabNavigator },
      Boo: BareLeafRouteConfig,
    });
    const state = router.getStateForAction({
      type: NavigationActions.NAVIGATE,
      routeName: 'Bar',
    });
    expect(state).toEqual({
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        {
          index: 1,
          key: 'Baz',
          routeName: 'Baz',
          hidden: false,
          isTransitioning: false,
          routes: [
            { key: 'Foo', routeName: 'Foo', hidden: false },
            { key: 'Bar', routeName: 'Bar', hidden: false },
          ],
        },
        { key: 'Boo', routeName: 'Boo', hidden: false },
      ],
    });
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Foo' },
      state
    );
    expect(state2).toEqual({
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        {
          index: 0,
          key: 'Baz',
          routeName: 'Baz',
          hidden: false,
          isTransitioning: false,
          routes: [
            { key: 'Foo', routeName: 'Foo', hidden: false },
            { key: 'Bar', routeName: 'Bar', hidden: false },
          ],
        },
        { key: 'Boo', routeName: 'Boo', hidden: false },
      ],
    });
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Foo' },
      state2
    );
    expect(state3).toEqual(null);
  });

  test('Handles linking across of deeply nested tabs', () => {
    const ChildNavigator0 = () => <div />;
    ChildNavigator0.router = TabRouter({
      Boo: BareLeafRouteConfig,
      Baz: BareLeafRouteConfig,
    });
    const ChildNavigator1 = () => <div />;
    ChildNavigator1.router = TabRouter({
      Zoo: BareLeafRouteConfig,
      Zap: BareLeafRouteConfig,
    });
    const MidNavigator = () => <div />;
    MidNavigator.router = TabRouter({
      Foo: { screen: ChildNavigator0 },
      Bar: { screen: ChildNavigator1 },
    });
    const router = TabRouter({
      Foo: { screen: MidNavigator },
      Gah: BareLeafRouteConfig,
    });
    const state = router.getStateForAction(INIT_ACTION);
    expect(state).toEqual({
      index: 0,
      isTransitioning: false,
      routes: [
        {
          index: 0,
          key: 'Foo',
          routeName: 'Foo',
          hidden: false,
          isTransitioning: false,
          routes: [
            {
              index: 0,
              key: 'Foo',
              routeName: 'Foo',
              hidden: false,
              isTransitioning: false,
              routes: [
                { key: 'Boo', routeName: 'Boo', hidden: false },
                { key: 'Baz', routeName: 'Baz', hidden: false },
              ],
            },
            {
              index: 0,
              key: 'Bar',
              routeName: 'Bar',
              isTransitioning: false,
              hidden: false,
              routes: [
                { key: 'Zoo', routeName: 'Zoo', hidden: false },
                { key: 'Zap', routeName: 'Zap', hidden: false },
              ],
            },
          ],
        },
        { key: 'Gah', routeName: 'Gah', hidden: false },
      ],
    });
    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Zap' },
      state
    );
    expect(state2).toEqual({
      index: 0,
      isTransitioning: false,
      routes: [
        {
          index: 1,
          key: 'Foo',
          routeName: 'Foo',
          hidden: false,
          isTransitioning: false,
          routes: [
            {
              index: 0,
              key: 'Foo',
              routeName: 'Foo',
              hidden: false,
              isTransitioning: false,
              routes: [
                { key: 'Boo', routeName: 'Boo', hidden: false },
                { key: 'Baz', routeName: 'Baz', hidden: false },
              ],
            },
            {
              index: 1,
              key: 'Bar',
              routeName: 'Bar',
              isTransitioning: false,
              hidden: false,
              routes: [
                { key: 'Zoo', routeName: 'Zoo', hidden: false },
                { key: 'Zap', routeName: 'Zap', hidden: false },
              ],
            },
          ],
        },
        { key: 'Gah', routeName: 'Gah', hidden: false },
      ],
    });
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Zap' },
      state2
    );
    expect(state3).toEqual(null);
    const state4 = router.getStateForAction({
      type: NavigationActions.NAVIGATE,
      routeName: 'Foo',
      action: {
        type: NavigationActions.NAVIGATE,
        routeName: 'Bar',
        action: { type: NavigationActions.NAVIGATE, routeName: 'Zap' },
      },
    });
    expect(state4).toEqual({
      index: 0,
      isTransitioning: false,
      routes: [
        {
          index: 1,
          key: 'Foo',
          routeName: 'Foo',
          isTransitioning: false,
          hidden: false,
          routes: [
            {
              index: 0,
              key: 'Foo',
              routeName: 'Foo',
              hidden: false,
              isTransitioning: false,
              routes: [
                { key: 'Boo', routeName: 'Boo', hidden: false },
                { key: 'Baz', routeName: 'Baz', hidden: false },
              ],
            },
            {
              index: 1,
              key: 'Bar',
              routeName: 'Bar',
              isTransitioning: false,
              hidden: false,
              routes: [
                { key: 'Zoo', routeName: 'Zoo', hidden: false },
                { key: 'Zap', routeName: 'Zap', hidden: false },
              ],
            },
          ],
        },
        { key: 'Gah', routeName: 'Gah', hidden: false },
      ],
    });
  });

  test('Handles path configuration', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      Foo: {
        path: 'f',
        screen: ScreenA,
      },
      Bar: {
        path: 'b',
        screen: ScreenB,
      },
    });
    const params = { foo: '42' };
    const action = router.getActionForPathAndParams('b/anything', params);
    const expectedAction = {
      params,
      routeName: 'Bar',
      type: NavigationActions.NAVIGATE,
    };
    expect(action).toEqual(expectedAction);

    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const expectedState = {
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
    };
    expect(state).toEqual(expectedState);
    const state2 = router.getStateForAction(expectedAction, state);
    const expectedState2 = {
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false },
        { key: 'Bar', routeName: 'Bar', hidden: false, params },
      ],
    };
    expect(state2).toEqual(expectedState2);
    expect(router.getComponentForState(expectedState)).toEqual(ScreenA);
    expect(router.getComponentForState(expectedState2)).toEqual(ScreenB);
    expect(router.getPathAndParamsForState(expectedState).path).toEqual('f');
    expect(router.getPathAndParamsForState(expectedState2).path).toEqual('b');
  });

  test('Handles default configuration', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      Foo: {
        path: '',
        screen: ScreenA,
      },
      Bar: {
        path: 'b',
        screen: ScreenB,
      },
    });
    const action = router.getActionForPathAndParams('', { foo: '42' });
    expect(action).toEqual({
      params: {
        foo: '42',
      },
      routeName: 'Foo',
      type: NavigationActions.NAVIGATE,
    });
  });

  test('Gets deep path', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    ScreenA.router = TabRouter({
      Boo: { screen: ScreenB },
      Baz: { screen: ScreenB },
    });
    const router = TabRouter({
      Foo: {
        path: 'f',
        screen: ScreenA,
      },
      Bar: {
        screen: ScreenB,
      },
    });

    const state = {
      index: 0,
      isTransitioning: false,
      routes: [
        {
          index: 1,
          key: 'Foo',
          routeName: 'Foo',
          isTransitioning: false,
          routes: [
            { key: 'Boo', routeName: 'Boo', hidden: false },
            { key: 'Baz', routeName: 'Baz', hidden: false },
          ],
        },
        { key: 'Bar', routeName: 'Bar', hidden: false },
      ],
    };
    const { path } = router.getPathAndParamsForState(state);
    expect(path).toEqual('f/Baz');
  });

  test('Can navigate to other tab (no router) with params', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;

    const router = TabRouter({
      a: { screen: ScreenA },
      b: { screen: ScreenB },
    });

    const state0 = router.getStateForAction(INIT_ACTION);

    expect(state0).toEqual({
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'a', routeName: 'a', hidden: false },
        { key: 'b', routeName: 'b', hidden: false },
      ],
    });

    const params = { key: 'value' };

    const state1 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'b', params },
      state0
    );

    expect(state1).toEqual({
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'a', routeName: 'a', hidden: false },
        { key: 'b', routeName: 'b', hidden: false, params },
      ],
    });
  });

  test('Back actions are not propagated to inactive children', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const ScreenC = () => <div />;
    const InnerNavigator = () => <div />;
    InnerNavigator.router = TabRouter({
      a: { screen: ScreenA },
      b: { screen: ScreenB },
    });

    const router = TabRouter(
      {
        inner: { screen: InnerNavigator },
        c: { screen: ScreenC },
      },
      {
        backBehavior: 'none',
      }
    );

    const state0 = router.getStateForAction(INIT_ACTION);

    const state1 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'b' },
      state0
    );

    const state2 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'c' },
      state1
    );

    const state3 = router.getStateForAction(
      { type: NavigationActions.BACK },
      state2
    );

    expect(state3).toEqual(state2);
  });

  test('Back behavior initialRoute works', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      a: { screen: ScreenA },
      b: { screen: ScreenB },
    });

    const state0 = router.getStateForAction(INIT_ACTION);

    const state1 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'b' },
      state0
    );

    const state2 = router.getStateForAction(
      { type: NavigationActions.BACK },
      state1
    );

    expect(state2).toEqual(state0);
  });

  test('pop action works as expected', () => {
    const TestRouter = StackRouter({
      foo: { screen: () => <div /> },
      bar: { screen: () => <div /> },
    });

    const state = {
      index: 3,
      isTransitioning: false,
      routes: [
        { key: 'A', routeName: 'foo' },
        { key: 'B', routeName: 'bar', params: { bazId: '321' } },
        { key: 'C', routeName: 'foo' },
        { key: 'D', routeName: 'bar' },
      ],
    };
    const poppedState = TestRouter.getStateForAction(
      NavigationActions.pop(),
      state
    );
    expect(poppedState.routes.length).toBe(3);
    expect(poppedState.index).toBe(2);
    expect(poppedState.isTransitioning).toBe(true);

    const poppedState2 = TestRouter.getStateForAction(
      NavigationActions.pop({ n: 2, immediate: true }),
      state
    );
    expect(poppedState2.routes.length).toBe(2);
    expect(poppedState2.index).toBe(1);
    expect(poppedState2.isTransitioning).toBe(false);

    const poppedState3 = TestRouter.getStateForAction(
      NavigationActions.pop({ n: 5 }),
      state
    );
    expect(poppedState3.routes.length).toBe(1);
    expect(poppedState3.index).toBe(0);
    expect(poppedState3.isTransitioning).toBe(true);
  });

  test('Inner actions are only unpacked if the current tab matches', () => {
    const PlainScreen = () => <div />;
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    ScreenB.router = StackRouter({
      Baz: { screen: PlainScreen },
      Zoo: { screen: PlainScreen },
    });
    ScreenA.router = StackRouter({
      Bar: { screen: PlainScreen },
      Boo: { screen: ScreenB },
    });
    const router = TabRouter({
      Foo: { screen: ScreenA },
    });
    const screenApreState = {
      index: 0,
      key: 'Init',
      isTransitioning: false,
      routeName: 'Foo',
      routes: [{ key: 'Init', routeName: 'Bar' }],
    };
    const preState = {
      index: 0,
      isTransitioning: false,
      routes: [screenApreState],
    };

    const comparable = state => {
      let result = {};
      if (typeof state.routeName === 'string') {
        result = { routeName: state.routeName };
      }
      if (state.routes instanceof Array) {
        result = {
          ...result,
          routes: state.routes.map(comparable),
        };
      }
      return result;
    };

    const action = NavigationActions.navigate({
      routeName: 'Boo',
      action: NavigationActions.navigate({ routeName: 'Zoo' }),
    });

    const expectedState = ScreenA.router.getStateForAction(
      action,
      screenApreState
    );
    const state = router.getStateForAction(action, preState);
    const innerState = state ? state.routes[0] : state;

    expect(expectedState && comparable(expectedState)).toEqual(
      innerState && comparable(innerState)
    );
  });

  test('Un-hides a hidden tab', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter(
      {
        Foo: { screen: ScreenA },
        Bar: { screen: ScreenB },
      },
      {
        hiddenTabs: ['Bar'],
      }
    );
    // It inits the navigation state with hidden: true for the Bar tab
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const expectedState = {
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: true, params: undefined },
      ],
    };
    expect(state).toEqual(expectedState);
    // It sets hidden: false for the Bar tab
    const state2 = router.getStateForAction(
      { type: NavigationActions.SHOW_TAB, tabRouteName: 'Bar' },
      state
    );
    const expectedState2 = {
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: false, params: undefined },
      ],
    };
    expect(state2).toEqual(expectedState2);
    // It navigates to the Bar tab
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state2
    );
    const expectedState3 = {
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: false, params: undefined },
      ],
    };
    expect(state3).toEqual(expectedState3);
    expect(router.getComponentForState(expectedState2)).toEqual(ScreenA);
    expect(router.getComponentForState(expectedState3)).toEqual(ScreenB);
  });

  test('Hides a shown tab', () => {
    const ScreenA = () => <div />;
    const ScreenB = () => <div />;
    const router = TabRouter({
      Foo: { screen: ScreenA },
      Bar: { screen: ScreenB },
    });
    // It inits the navigation state with hidden: false for the all tabs
    const state = router.getStateForAction({ type: NavigationActions.INIT });
    const expectedState = {
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: false, params: undefined },
      ],
    };
    expect(state).toEqual(expectedState);
    // It sets hidden: true for the Bar tab
    const state2 = router.getStateForAction(
      { type: NavigationActions.HIDE_TAB, tabRouteName: 'Bar' },
      state
    );
    const expectedState2 = {
      index: 0,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: true, params: undefined },
      ],
    };
    expect(state2).toEqual(expectedState2);
    // It navigates to the hidden Bar tab
    // NOTE: Should we be able to navigate explicitly to a hidden tab ? Maybe send a warning
    const state3 = router.getStateForAction(
      { type: NavigationActions.NAVIGATE, routeName: 'Bar' },
      state2
    );
    const expectedState3 = {
      index: 1,
      isTransitioning: false,
      routes: [
        { key: 'Foo', routeName: 'Foo', hidden: false, params: undefined },
        { key: 'Bar', routeName: 'Bar', hidden: true, params: undefined },
      ],
    };
    expect(state3).toEqual(expectedState3);
    expect(router.getComponentForState(expectedState2)).toEqual(ScreenA);
    expect(router.getComponentForState(expectedState3)).toEqual(ScreenB);
  });
});
