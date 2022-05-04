import {
	CaretDownFilled,
	CaretUpFilled,
	LogoutOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Divider,
	Dropdown,
	Layout,
	Menu,
	Space,
	Typography,
} from 'antd';
import remove from 'api/browser/localstorage/remove';
import { LOCALSTORAGE } from 'constants/localStorage';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import setTheme, { AppMode } from 'lib/theme/setTheme';
import React, { useCallback, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ToggleDarkMode } from 'store/actions';
import { AppState } from 'store/reducers';
import AppActions from 'types/actions';
import {
	LOGGED_IN,
	UPDATE_USER,
	UPDATE_USER_ACCESS_REFRESH_ACCESS_TOKEN,
	UPDATE_USER_ORG_ROLE,
} from 'types/actions/app';
import AppReducer from 'types/reducer/app';

import CurrentOrganization from './CurrentOrganization';
import SignedInAS from './SignedInAs';
import {
	Container,
	LogoutContainer,
	MenuContainer,
	ToggleButton,
} from './styles';

function HeaderContainer({ toggleDarkMode }: Props): JSX.Element {
	const { isDarkMode, user, currentVersion } = useSelector<AppState, AppReducer>(
		(state) => state.app,
	);
	const [isUserDropDownOpen, setIsUserDropDownOpen] = useState<boolean>();
	const dispatch = useDispatch<Dispatch<AppActions>>();

	const onToggleThemeHandler = useCallback(() => {
		const preMode: AppMode = isDarkMode ? 'lightMode' : 'darkMode';
		setTheme(preMode);

		const id: AppMode = preMode;
		const { head } = document;
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = !isDarkMode ? '/css/antd.dark.min.css' : '/css/antd.min.css';
		link.media = 'all';
		link.id = id;
		head.appendChild(link);

		link.onload = (): void => {
			toggleDarkMode();
			const prevNode = document.getElementById('appMode');
			prevNode?.remove();
		};
	}, [toggleDarkMode, isDarkMode]);

	const onArrowClickHandler: VoidFunction = () => {
		setIsUserDropDownOpen((state) => !state);
	};

	const onClickLogoutHandler = (): void => {
		remove(LOCALSTORAGE.AUTH_TOKEN);
		remove(LOCALSTORAGE.IS_LOGGED_IN);
		remove(LOCALSTORAGE.REFRESH_AUTH_TOKEN);
		dispatch({
			type: LOGGED_IN,
			payload: {
				isLoggedIn: false,
			},
		});
		dispatch({
			type: UPDATE_USER_ORG_ROLE,
			payload: {
				org: null,
				role: null,
			},
		});
		dispatch({
			type: UPDATE_USER,
			payload: {
				ROLE: 'VIEWER',
				email: '',
				name: '',
				orgId: '',
				orgName: '',
				profilePictureURL: '',
				userId: '',
			},
		});
		dispatch({
			type: UPDATE_USER_ACCESS_REFRESH_ACCESS_TOKEN,
			payload: {
				accessJwt: '',
				refreshJwt: '',
			},
		});

		history.push(ROUTES.LOGIN);
	};

	const menu = (
		<MenuContainer>
			<Menu.ItemGroup>
				<SignedInAS />
				<Divider />
				<CurrentOrganization onToggle={onArrowClickHandler} />
				<Divider />
				<LogoutContainer>
					<LogoutOutlined />
					<div
						tabIndex={0}
						onKeyDown={(e): void => {
							if (e.key === 'Enter' || e.key === 'Space') {
								onClickLogoutHandler();
							}
						}}
						role="button"
						onClick={onClickLogoutHandler}
					>
						<Typography.Link>Logout</Typography.Link>
					</div>
				</LogoutContainer>
			</Menu.ItemGroup>
		</MenuContainer>
	);

	return (
		<Layout.Header
			style={{
				paddingLeft: '1.125rem',
				paddingRight: '1.125rem',
			}}
		>
			<Container>
				<NavLink
					style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
					to={ROUTES.APPLICATION}
				>
					<img src={`/signoz.svg?currentVersion=${currentVersion}`} alt="SigNoz" />
					<Typography.Title style={{ margin: 0, color: '#DBDBDB' }} level={4}>
						SigNoz
					</Typography.Title>
				</NavLink>
				<Space align="center">
					<ToggleButton
						checked={isDarkMode}
						onChange={onToggleThemeHandler}
						defaultChecked={isDarkMode}
						checkedChildren="🌜"
						unCheckedChildren="🌞"
					/>

					<Dropdown
						onVisibleChange={onArrowClickHandler}
						trigger={['click']}
						overlay={menu}
						visible={isUserDropDownOpen}
					>
						<Space>
							<Avatar shape="circle">{user?.name[0]}</Avatar>
							{!isUserDropDownOpen ? (
								<CaretDownFilled
									style={{
										color: '#DBDBDB',
									}}
								/>
							) : (
								<CaretUpFilled
									style={{
										color: '#DBDBDB',
									}}
								/>
							)}
						</Space>
					</Dropdown>
				</Space>
			</Container>
		</Layout.Header>
	);
}

interface DispatchProps {
	toggleDarkMode: () => void;
}

const mapDispatchToProps = (
	dispatch: ThunkDispatch<unknown, unknown, AppActions>,
): DispatchProps => ({
	toggleDarkMode: bindActionCreators(ToggleDarkMode, dispatch),
});

type Props = DispatchProps;

export default connect(null, mapDispatchToProps)(HeaderContainer);
