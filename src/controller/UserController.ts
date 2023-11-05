import { checkUserTokenService, getUserInfoByUidService, updateOrCreateUserInfoService, updateUserEmailService, userExistsCheckService, userLoginService, userRegistrationService } from '../service/UserService.js'
import { koaCtx, koaNext } from '../type/koaTypes.js'
import { UpdateOrCreateUserInfoRequestDto, UpdateUserEmailRequestDto, UserExistsCheckRequestDto, UserLoginRequestDto, UserLogoutResponseDto, UserRegistrationRequestDto } from './UserControllerDto.js'

/**
 * 用户注册
 * @param ctx context
 * @param next context
 * @returns 用户注册的结果，如果注册成功会包含 token
 */
export const userRegistrationController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UserRegistrationRequestDto>
	const userRegistrationData: UserRegistrationRequestDto = {
		email: data?.email,
		passwordHash: data?.passwordHash,
		passwordHint: data?.passwordHint,
	}
	const userRegistrationResult = await userRegistrationService(userRegistrationData)
	
	const cookieOption = {
		httpOnly: true, // 仅 HTTP 访问，浏览器中的 js 无法访问。
		secure: true,
		sameSite: 'strict' as boolean | 'none' | 'strict' | 'lax',
		maxAge: 1000 * 60 * 60 * 24 * 365, // 设置有效期为 1 年
		// domain: 'yourdomain.com'   // TODO 如果你在生产环境，可以设置 domain
	}
	ctx.cookies.set('token', userRegistrationResult.token, cookieOption)
	ctx.cookies.set('email', data?.email, cookieOption)
	ctx.cookies.set('uid', `${userRegistrationResult.uid}`, cookieOption)
	ctx.body = userRegistrationResult
	await next()
}

/**
 * 用户登录
 * @param ctx context
 * @param next context
 * @returns 用户登录的结果，如果登录成功会包含 token
 */
export const userLoginController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UserLoginRequestDto>
	const userRegistrationData: UserLoginRequestDto = {
		email: data?.email,
		passwordHash: data?.passwordHash,
	}
	const userLoginResult = await userLoginService(userRegistrationData)

	const cookieOption = {
		httpOnly: true, // 仅 HTTP 访问，浏览器中的 js 无法访问。
		secure: true,
		sameSite: 'strict' as boolean | 'none' | 'strict' | 'lax',
		maxAge: 1000 * 60 * 60 * 24 * 365, // 设置有效期为 1 年
		// domain: 'yourdomain.com'   // TODO 如果你在生产环境，可以设置 domain
	}
	ctx.cookies.set('token', userLoginResult.token, cookieOption)
	ctx.cookies.set('email', userLoginResult.email, cookieOption)
	ctx.cookies.set('uid', `${userLoginResult.uid}`, cookieOption)
	ctx.body = userLoginResult
	await next()
}

/**
 * 检查一个用户是否存在
 * @param ctx context
 * @param next context
 * @return UserExistsCheckResultDto 检查结果，如果用户邮箱已存在或查询失败则 exists: true
 */
export const userExistsCheckController = async (ctx: koaCtx, next: koaNext) => {
	const email = ctx.query.email as string
	const userExistsCheckData: UserExistsCheckRequestDto = {
		email: email || '',
	}
	ctx.body = await userExistsCheckService(userExistsCheckData)
	await next()
}

/**
 * 更新用户邮箱
 * @param ctx context
 * @param next context
 * @return UpdateUserEmailResponseDto 更新结果，如果更新成功则 success: true，不成功则 success: false
 */
export const updateUserEmailController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UpdateUserEmailRequestDto>
	const userRegistrationData: UpdateUserEmailRequestDto = {
		uid: data?.uid,
		oldEmail: data?.oldEmail,
		newEmail: data?.newEmail,
		passwordHash: data?.passwordHash,
	}
	ctx.body = await updateUserEmailService(userRegistrationData)
	await next()
}

/**
 * 更新或创建用户信息
 * @param ctx context
 * @param next context
 * @return UpdateOrCreateUserInfoResponseDto 更新或创建后的结果和新的用户信息，如果更新成功则 success: true，不成功则 success: false
 */
export const updateOrCreateUserInfoController = async (ctx: koaCtx, next: koaNext) => {
	const data = ctx.request.body as Partial<UpdateOrCreateUserInfoRequestDto>
	const updateOrCreateUserInfoRequest: UpdateOrCreateUserInfoRequestDto = {
		username: data?.username,
		avatar: data?.avatar,
		userBannerImage: data?.userBannerImage,
		signature: data?.signature,
		gender: data?.gender,
		label: data?.label,
	}
	const uid = parseInt(ctx.cookies.get('uid'), 10)
	const token = ctx.cookies.get('token')
	ctx.body = await updateOrCreateUserInfoService(updateOrCreateUserInfoRequest, uid, token)
	await next()
}

/**
 * 更新或创建用户信息
 * @param ctx context
 * @param next context
 * @return GetUserInfoByUidResponseDto 通过 uid 获取到的用户信息，如果获取成功则 success: true，不成功则 success: false
 */
export const getUserInfoByUidController = async (ctx: koaCtx, next: koaNext) => {
	const uid = parseInt(ctx.cookies.get('uid'), 10)
	const token = ctx.cookies.get('token')
	ctx.body = await getUserInfoByUidService(uid, token)
	await next()
}

/**
 * 校验用户 token
 * @param ctx context
 * @param next context
 * @return CheckUserTokenResponseDto 通过 token 中的 uid 和 token 校验用户，如果校验成功则 success: true 并且 userTokenOk: true，不成功则 success: false 或 userTokenOk: false
 */
export const checkUserTokenController = async (ctx: koaCtx, next: koaNext) => {
	const uid = parseInt(ctx.cookies.get('uid'), 10)
	const token = ctx.cookies.get('token')
	ctx.body = await checkUserTokenService(uid, token)
	await next()
}

export const userLogoutController = async (ctx: koaCtx, next: koaNext) => {
	// TODO 理论上这里还可以做一些操作，比如说记录用户登出事件...

	const cookieOption = {
		httpOnly: true, // 仅 HTTP 访问，浏览器中的 js 无法访问。
		secure: true,
		sameSite: 'strict' as boolean | 'none' | 'strict' | 'lax',
		maxAge: 0, // 立即过期
		expires: new Date(0), // 设置一个以前的日期让浏览器删除 cookie
		// domain: 'yourdomain.com'   // TODO 如果你在生产环境，可以设置 domain
	}

	ctx.cookies.set('token', '', cookieOption)
	ctx.cookies.set('email', '', cookieOption)
	ctx.cookies.set('uid', '', cookieOption)

	ctx.body = { success: true, message: '登出成功' } as UserLogoutResponseDto

	await next()
}
